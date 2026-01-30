'use client'

import { createContext, useContext, useMemo, useState } from 'react'

export type PendingQuery = {
  conversationId: string
  query: string
}

type ChatContextValue = {
  pendingQuery: PendingQuery | null
  setPendingQuery: (value: PendingQuery | null) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [pendingQuery, setPendingQuery] = useState<PendingQuery | null>(null)

  const value = useMemo(
    () => ({ pendingQuery, setPendingQuery }),
    [pendingQuery]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}
