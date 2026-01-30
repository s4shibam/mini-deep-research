import type { ConversationSummary, ConversationWithMessages } from '@repo/types'

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const response = await fetch('/api/conversations')
  if (!response.ok) {
    throw new Error('Failed to load conversations')
  }
  return response.json()
}

export async function fetchConversation(
  conversationId: string
): Promise<ConversationWithMessages> {
  const response = await fetch(`/api/conversations/${conversationId}`)
  if (!response.ok) {
    throw new Error('Conversation not found')
  }
  return response.json()
}

export async function postMessage(conversationId: string, text: string) {
  const response = await fetch(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text })
    }
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error ?? 'Failed to send message')
  }

  return response.json()
}
