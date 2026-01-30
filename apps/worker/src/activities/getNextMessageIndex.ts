import { prisma } from '@repo/database'

export async function getNextMessageIndex(input: {
  conversationId: string
}): Promise<number> {
  const last = await prisma.message.findFirst({
    where: { conversationId: input.conversationId },
    orderBy: { index: 'desc' },
    select: { index: true }
  })

  return (last?.index ?? -1) + 1
}
