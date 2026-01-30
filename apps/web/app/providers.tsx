'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ChatProvider } from '@/context/ChatContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={client}>
      <ChatProvider>{children}</ChatProvider>
    </QueryClientProvider>
  )
}
