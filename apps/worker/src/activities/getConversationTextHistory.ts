import { prisma, MessageSender } from '@repo/database'

export async function getConversationTextHistory(input: {
  conversationId: string
}): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages = await prisma.message.findMany({
    where: { conversationId: input.conversationId },
    orderBy: { index: 'asc' },
    select: { sender: true, content: true }
  })

  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (const message of messages) {
    if (!Array.isArray(message.content)) continue
    const text = message.content
      .filter(
        (block: any) =>
          block && block.type === 'text' && typeof block.text === 'string'
      )
      .map((block: any) => block.text)
      .join('\n')

    if (!text) continue

    history.push({
      role: message.sender === MessageSender.human ? 'user' : 'assistant',
      content: text
    })
  }

  return history
}
