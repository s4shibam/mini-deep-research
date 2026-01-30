export type ConversationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export type ToolName = 'web_search_with_relevancy' | 'fetch_web_page'

export type TextBlock = {
  type: 'text'
  text: string
}

export type ToolUseBlock = {
  type: 'tool_use'
  id: string
  name: ToolName
  input: Record<string, any>
}

export type WebSearchResult = {
  subQueries: string[]
  results: Array<{
    url: string
    title: string
    snippet: string
    isRelevant: boolean
    reason?: string
    pageText?: string
    pageTextError?: string
  }>
}

export type FetchWebPageResult = {
  url: string
  text: string
}

export type ToolError = {
  error: string
  details?: string
}

export type ToolResultBlock = {
  type: 'tool_result'
  tool_use_id: string
  name: string
  content: WebSearchResult | FetchWebPageResult | ToolError
  is_error: boolean
}

export type MessageContent = Array<TextBlock | ToolUseBlock | ToolResultBlock>

export type ConversationSummary = {
  id: string
  status: ConversationStatus
  preview: string | null
  createdAt: string
}

export type ConversationWithMessages = {
  id: string
  status: ConversationStatus
  loaderText: string | null
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    sender: 'human' | 'assistant'
    index: number
    content: MessageContent
    createdAt: string
  }>
}

export type DeepResearchInput = {
  conversationId: string
  query: string
}

export type SubSearchInput = {
  conversationId: string
  originalQuery: string
  subQuery: string
}
