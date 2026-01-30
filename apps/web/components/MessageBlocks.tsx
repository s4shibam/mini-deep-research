import type {
  FetchWebPageResult,
  MessageContent,
  ToolError,
  ToolResultBlock,
  ToolUseBlock,
  WebSearchResult
} from '@repo/types'
import { CheckCircle2, FileText, Search, Sparkles, XCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import Markdown from '@/components/Markdown'

function isWebSearchResult(content: unknown): content is WebSearchResult {
  return Boolean(
    content &&
    typeof content === 'object' &&
    Array.isArray((content as WebSearchResult).results)
  )
}

function isFetchWebPageResult(content: unknown): content is FetchWebPageResult {
  return Boolean(
    content &&
    typeof content === 'object' &&
    typeof (content as FetchWebPageResult).text === 'string'
  )
}

function isToolError(content: unknown): content is ToolError {
  return Boolean(
    content &&
    typeof content === 'object' &&
    typeof (content as ToolError).error === 'string'
  )
}

function ToolUseCard({ block }: { block: ToolUseBlock }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value={`tool-${block.id}`}
        className="rounded-lg border border-gray-200 bg-gray-50 px-3"
      >
        <AccordionTrigger className="py-2 text-sm font-medium text-gray-700 hover:no-underline">
          <span className="flex items-center gap-2 capitalize">
            <Sparkles className="h-4 w-4 text-gray-500" />
            {block.name.split('_').join(' ')}
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mt-2 max-h-56 overflow-y-auto rounded bg-white p-2">
            <pre className="overflow-x-auto text-xs text-gray-600">
              {JSON.stringify(block.input, null, 2)}
            </pre>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function ToolResultCard({ block }: { block: ToolResultBlock }) {
  if (block.is_error || isToolError(block.content)) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {isToolError(block.content) ? block.content.error : 'Tool failed.'}
        </span>
      </div>
    )
  }

  if (isWebSearchResult(block.content)) {
    const totalResults = block.content.results.length
    const relevantCount = block.content.results.filter(
      (result) => result.isRelevant
    ).length
    const otherCount = totalResults - relevantCount

    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`web-${block.tool_use_id}`}
          className="rounded-lg border border-yellow-200 bg-yellow-50/75 px-3"
        >
          <AccordionTrigger className="py-2 text-sm font-medium text-yellow-800 hover:no-underline">
            <div className="flex w-full items-center gap-2 capitalize">
              <Search className="h-4 w-4" />
              <span>Web search</span>
              <span className="ml-auto flex items-center gap-2 px-2">
                <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-normal text-green-700">
                  {relevantCount} relevant
                </span>
                <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-normal text-yellow-800">
                  {otherCount} other
                </span>
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 max-h-72 overflow-y-auto pr-2">
              <div className="flex flex-wrap gap-2">
                {block.content.subQueries.map((query) => (
                  <span
                    key={query}
                    className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs text-yellow-900"
                  >
                    {query}
                  </span>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {block.content.results.map((result) => (
                  <div
                    key={result.url}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {result.title}
                      </a>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          result.isRelevant
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {result.isRelevant ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {result.isRelevant ? 'Relevant' : 'Other'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {result.snippet}
                    </p>
                    {result.reason && (
                      <p className="mt-1 text-xs text-gray-500">
                        {result.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  if (isFetchWebPageResult(block.content)) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`page-${block.tool_use_id}`}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3"
        >
          <AccordionTrigger className="py-2 text-sm font-medium text-blue-700 hover:no-underline">
            <span className="flex items-center gap-2 capitalize">
              <FileText className="h-4 w-4" />
              Fetched Page
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-2 max-h-56 overflow-y-auto pr-2">
              <a
                href={block.content.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                {block.content.url}
              </a>
              <p className="mt-2 text-sm text-gray-700">{block.content.text}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return null
}

export default function MessageBlocks({
  content
}: {
  content: MessageContent
}) {
  return (
    <div className="space-y-3">
      {content.map((block, index) => {
        if (block.type === 'text') {
          return (
            <Markdown
              key={index}
              content={block.text}
              className="text-gray-800"
            />
          )
        }

        if (block.type === 'tool_use') {
          return <ToolUseCard key={block.id} block={block} />
        }

        if (block.type === 'tool_result') {
          return <ToolResultCard key={block.tool_use_id} block={block} />
        }

        return null
      })}
    </div>
  )
}
