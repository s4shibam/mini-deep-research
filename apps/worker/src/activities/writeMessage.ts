import { prisma, ConversationStatus, MessageSender } from '@repo/database'
import type { MessageContent } from '@repo/types'

export async function writeMessage(input: {
  conversationId: string
  sender: MessageSender
  content: MessageContent
  index: number
  id: string
}): Promise<void> {
  await prisma.conversation.upsert({
    where: { id: input.conversationId },
    create: {
      id: input.conversationId,
      status: ConversationStatus.processing,
      workflowId: input.conversationId
    },
    update: {}
  })

  await prisma.message.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      conversationId: input.conversationId,
      sender: input.sender,
      index: input.index,
      content: input.content
    },
    update: {
      sender: input.sender,
      index: input.index,
      content: input.content
    }
  })
}
