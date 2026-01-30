import { prisma, ConversationStatus } from '@repo/database'

export async function updateConversationStatus(input: {
  conversationId: string
  status: ConversationStatus
  loaderText?: string | null
}): Promise<void> {
  const shouldClearLoader = input.status !== ConversationStatus.processing
  const loaderText = shouldClearLoader ? null : (input.loaderText ?? undefined)

  await prisma.conversation.upsert({
    where: { id: input.conversationId },
    create: {
      id: input.conversationId,
      status: input.status,
      workflowId: input.conversationId,
      loaderText: shouldClearLoader ? null : (input.loaderText ?? null)
    },
    update: {
      status: input.status,
      ...(loaderText !== undefined ? { loaderText } : {})
    }
  })
}
