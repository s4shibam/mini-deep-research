'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Send } from 'lucide-react'
import ChatShell from '@/components/ChatShell'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatContext } from '@/context/ChatContext'

const prompts = [
  'Summarize recent research on battery recycling breakthroughs.',
  'Compare leading AI policy frameworks from US, EU, and UK.',
  'What are the latest trends in the carbon capture tech startups?'
]

export default function NewChatPage() {
  const router = useRouter()
  const { setPendingQuery } = useChatContext()
  const [query, setQuery] = useState('')

  const placeholder = useMemo(
    () => prompts[Math.floor(Math.random() * prompts.length)],
    []
  )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const conversationId = crypto.randomUUID()
    setPendingQuery({ conversationId, query: trimmed })
    router.push(`/chat/${conversationId}`)
  }

  return (
    <ChatShell>
      <div className="flex h-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-800">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h1 className="text-4xl font-semibold">Mini Deep Research</h1>
            </div>
            <p className="mt-3 text-gray-600">
              Ask anything to start a research conversation
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {prompts.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start whitespace-normal rounded-xl px-4 py-3 text-left text-sm text-gray-700"
                  onClick={() => setQuery(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                rows={4}
                className="min-h-[48px] w-full resize-none rounded-xl border-gray-300 px-4 py-3 pr-12 text-gray-800 shadow-sm focus-visible:ring-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!query.trim()}
                size="icon"
                className="absolute bottom-2 right-2"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </ChatShell>
  )
}
