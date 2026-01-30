import { NextResponse } from 'next/server'
import { prisma } from '@repo/database'
import type {
  ConversationSummary,
  MessageContent,
  TextBlock
} from '@repo/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      messages: {
        orderBy: { index: 'asc' },
        take: 1
      }
    }
  })

  const summaries: ConversationSummary[] = conversations.map((conversation) => {
    const firstMessage = conversation.messages[0]
    const preview =
      typeof firstMessage?.content === 'object' &&
      Array.isArray(firstMessage.content)
        ? (firstMessage.content as MessageContent)
            .map((block) =>
              block.type === 'text' ? (block as TextBlock).text : null
            )
            .find((text): text is string => typeof text === 'string')
        : null

    return {
      id: conversation.id,
      status: conversation.status,
      preview: preview ?? null,
      createdAt: conversation.createdAt.toISOString()
    }
  })

  return NextResponse.json(summaries)
}
