'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Send } from 'lucide-react'
import ChatShell from '@/components/ChatShell'
import MessageBlocks from '@/components/MessageBlocks'
import Markdown from '@/components/Markdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatContext } from '@/context/ChatContext'
import { postMessage } from '@/lib/api'
import { useConversationPolling } from '@/hooks/useConversationPolling'
import type { ConversationWithMessages } from '@repo/types'

type ConversationMessage = ConversationWithMessages['messages'][number]

function formatMessages(messages: ConversationMessage[]) {
  const grouped: ConversationMessage[] = []

  for (const message of messages) {
    const last = grouped[grouped.length - 1]
    if (message.sender === 'assistant' && last?.sender === 'assistant') {
      grouped[grouped.length - 1] = {
        ...last,
        id: `${last.id}--${message.id}`,
        content: [...last.content, ...message.content]
      }
      continue
    }

    grouped.push(message)
  }

  return grouped
}

export default function ChatPage() {
  const params = useParams()
  const conversationId = String(params.id ?? '')
  const { pendingQuery, setPendingQuery } = useChatContext()
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()
  const submittedPendingIdRef = useRef<string | null>(null)

  const { data, isLoading, error } = useConversationPolling(conversationId)

  const mutation = useMutation({
    mutationFn: (text: string) => postMessage(conversationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId]
      })
    }
  })

  const status = data?.status ?? (error ? 'idle' : 'pending')
  const isBusy = status === 'pending' || status === 'processing'
  const isInputDisabled =
    isBusy ||
    (mutation.isPending && status !== 'completed' && status !== 'failed')
  const loaderText =
    status === 'processing' ? data?.loaderText?.trim() || 'Processing...' : null

  useEffect(() => {
    if (!pendingQuery) return
    if (pendingQuery.conversationId !== conversationId) return
    if (submittedPendingIdRef.current === pendingQuery.conversationId) return

    submittedPendingIdRef.current = pendingQuery.conversationId
    setPendingQuery(null)
    mutation.mutate(pendingQuery.query)
  }, [conversationId, mutation, pendingQuery, setPendingQuery])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    mutation.mutate(trimmed)
    setInput('')
  }

  const messageList = useMemo(
    () => formatMessages(data?.messages ?? []),
    [data]
  )

  return (
    <ChatShell>
      <div className="flex h-screen flex-col">
        <div className="flex-1 overflow-y-scroll">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {isLoading && (
              <p className="text-center text-sm text-gray-500">Loading...</p>
            )}

            {error && (
              <p className="text-center text-sm text-gray-500">
                Send a message to start the conversation.
              </p>
            )}

            {!isLoading && !messageList.length && !error && (
              <p className="text-center text-sm text-gray-500">
                No messages yet.
              </p>
            )}

            <div className="space-y-4">
              {messageList.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'human' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl shadow-sm ${
                      message.sender === 'human'
                        ? 'bg-yellow-50 px-4 py-3 text-gray-800'
                        : 'w-full'
                    }`}
                  >
                    {message.sender === 'human' ? (
                      message.content
                        .filter((block) => block.type === 'text')
                        .map((block, index) => (
                          <Markdown key={index} content={block.text} />
                        ))
                    ) : (
                      <MessageBlocks content={message.content} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {status === 'processing' && loaderText && (
              <div className="my-3 flex items-center gap-2 text-base text-gray-500">
                <Loader2 className="size-4 animate-spin text-yellow-500" />
                <span>{loaderText}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl pb-4">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isBusy ? 'Processing...' : 'Send a message...'}
              rows={4}
              disabled={isInputDisabled}
              className="min-h-[48px] w-full resize-none rounded-xl border-gray-300 px-4 py-3 pr-12 text-gray-800 shadow-sm focus-visible:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              disabled={isInputDisabled || !input.trim()}
              size="icon"
              className="absolute bottom-2 right-2"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </ChatShell>
  )
}
