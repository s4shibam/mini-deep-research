'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { fetchConversations } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Sidebar() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations
  })
  const [filter, setFilter] = useState('')

  const filteredChats = useMemo(() => {
    if (!data?.length) return []
    const normalized = filter.trim().toLowerCase()
    if (!normalized) return data
    return data.filter((chat) =>
      (chat.preview ?? 'Untitled').toLowerCase().includes(normalized)
    )
  }, [data, filter])

  const hasChats = Boolean(data?.length)
  const hasFilter = filter.trim().length > 0
  const showNoChats = !isLoading && !error && !hasChats
  const showNoMatches =
    !isLoading && !error && hasChats && hasFilter && !filteredChats.length

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <Button asChild className="w-full justify-center gap-2">
          <Link href="/chat/new">
            <Plus className="h-4 w-4" />
            New chat
          </Link>
        </Button>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search chats"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <p className="px-3 py-2 text-sm text-gray-500">Loading...</p>
        )}
        {error && (
          <p className="px-3 py-2 text-sm text-red-500">Failed to load.</p>
        )}
        {showNoChats && (
          <p className="px-3 py-2 text-sm text-gray-500">No chats yet.</p>
        )}
        {showNoMatches && (
          <p className="px-3 py-2 text-sm text-gray-500">No matches.</p>
        )}
        {filteredChats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-100"
          >
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-gray-800">
                {chat.preview ?? 'Untitled'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
