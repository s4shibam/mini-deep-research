'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchConversation } from '@/lib/api'

export function useConversationPolling(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 5000
      return data.status === 'pending' || data.status === 'processing'
        ? 5000
        : false
    }
  })
}
