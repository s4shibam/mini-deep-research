import { NextResponse } from 'next/server'
import { prisma } from '@repo/database'
import type { ConversationWithMessages } from '@repo/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { index: 'asc' }
      }
    }
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const payload: ConversationWithMessages = {
    id: conversation.id,
    status: conversation.status,
    loaderText: conversation.loaderText ?? null,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      index: message.index,
      content:
        message.content as ConversationWithMessages['messages'][number]['content'],
      createdAt: message.createdAt.toISOString()
    }))
  }

  return NextResponse.json(payload)
}
