import { NextResponse } from 'next/server'
import { WorkflowExecutionAlreadyStartedError } from '@temporalio/client'
import { prisma, ConversationStatus, MessageSender } from '@repo/database'
import { getTemporalClient } from '@/lib/temporal'

export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''

  if (!text) {
    return NextResponse.json(
      { error: 'Message text required' },
      { status: 400 }
    )
  }

  const existing = await prisma.conversation.findUnique({
    where: { id },
    select: { status: true }
  })

  if (
    existing?.status === ConversationStatus.processing ||
    existing?.status === ConversationStatus.pending
  ) {
    return NextResponse.json(
      { error: 'Conversation is already processing' },
      { status: 409 }
    )
  }

  if (existing?.status === ConversationStatus.failed) {
    return NextResponse.json(
      { error: 'Conversation failed and is locked' },
      { status: 409 }
    )
  }

  const conversation = await prisma.conversation.upsert({
    where: { id },
    create: {
      id,
      status: ConversationStatus.pending,
      workflowId: id,
      loaderText: null
    },
    update: {
      status: ConversationStatus.pending,
      loaderText: null
    }
  })

  const lastMessage = await prisma.message.findFirst({
    where: { conversationId: conversation.id },
    orderBy: { index: 'desc' },
    select: { index: true }
  })

  const nextIndex = (lastMessage?.index ?? -1) + 1

  await prisma.message.create({
    data: {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      sender: MessageSender.human,
      index: nextIndex,
      content: [{ type: 'text', text }]
    }
  })

  const client = await getTemporalClient()

  try {
    await client.workflow.start('deepResearchWorkflow', {
      taskQueue: 'deep-research',
      workflowId: conversation.id,
      args: [
        {
          conversationId: conversation.id,
          query: text
        }
      ]
    })
  } catch (error) {
    if (!(error instanceof WorkflowExecutionAlreadyStartedError)) {
      throw error
    }
  }

  return NextResponse.json({ ok: true })
}
