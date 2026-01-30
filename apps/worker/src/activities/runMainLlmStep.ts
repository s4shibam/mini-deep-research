import { openai } from '@ai-sdk/openai'
import { generateText, stepCountIs, tool, type ModelMessage } from 'ai'
import { z } from 'zod'

const MAIN_MODEL = 'gpt-4o'

export type LlmToolCall = {
  id: string
  name: string
  args: Record<string, any>
}

export type LlmStepResult = {
  text: string
  toolCalls: LlmToolCall[]
}

const toolDefinitions = {
  web_search_with_relevancy: tool({
    description:
      'Search the web for the given query, filter results for relevance, and return structured results.',
    inputSchema: z.object({
      query: z.string(),
      subQueries: z.array(z.string()).min(1).optional()
    })
  }),
  fetch_web_page: tool({
    description: 'Fetch a direct web page URL and return cleaned text content.',
    inputSchema: z.object({
      url: z.string().url()
    })
  })
}

export async function runMainLlmStep(input: {
  system: string
  messages: ModelMessage[]
}): Promise<LlmStepResult> {
  console.log('LLM step', { messageCount: input.messages.length })
  const result = await generateText({
    model: openai(MAIN_MODEL),
    system: input.system,
    messages: input.messages,
    tools: toolDefinitions,
    stopWhen: stepCountIs(1),
    temperature: 0.2
  })

  const toolCalls: LlmToolCall[] = (result.toolCalls ?? []).map((tc) => ({
    id: tc.toolCallId,
    name: tc.toolName,
    args: tc.input as Record<string, any>
  }))

  return {
    text: result.text ?? '',
    toolCalls
  }
}
