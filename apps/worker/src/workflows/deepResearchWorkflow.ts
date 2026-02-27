import { executeChild } from '@temporalio/workflow'
import type {
  DeepResearchInput,
  MessageContent,
  ToolUseBlock,
  ToolResultBlock,
  WebSearchResult,
  ToolError
} from '@repo/types'
import { ConversationStatus, MessageSender } from '@repo/database'
import type { ModelMessage } from 'ai'
import { MAIN_RESEARCH_ASSISTANT_PROMPT } from '../prompts'
import { subSearchWorkflow } from './subSearchWorkflow'
import {
  runMainLlmStep,
  writeMessage,
  updateConversationStatus,
  getNextMessageIndex,
  getConversationTextHistory,
  executeFetchWebPage
} from './activityProxies'

const TASK_QUEUE = 'deep-research'

export async function deepResearchWorkflow(
  input: DeepResearchInput
): Promise<void> {
  const { conversationId, query } = input

  await updateConversationStatus({
    conversationId,
    status: ConversationStatus.processing,
    loaderText: 'Starting research and gathering sources...'
  })

  let nextIndex = await getNextMessageIndex({ conversationId })

  const appendMessage = async (
    sender: MessageSender,
    content: MessageContent,
    id?: string
  ) => {
    const messageId = id ?? `${conversationId}-${nextIndex}`
    await writeMessage({
      conversationId,
      sender,
      content,
      index: nextIndex,
      id: messageId
    })
    nextIndex += 1
  }

  const history = await getConversationTextHistory({ conversationId })
  const llmMessages: ModelMessage[] =
    history.length > 0
      ? history.map((h) => ({ role: h.role, content: h.content }))
      : [{ role: 'user', content: query }]

  try {
    for (let step = 0; step < 8; step += 1) {
      const result = await runMainLlmStep({
        system: MAIN_RESEARCH_ASSISTANT_PROMPT,
        messages: llmMessages
      })

      if (!result.toolCalls.length) {
        const finalText = (result.text ?? '').trim()
        if (finalText) {
          await updateConversationStatus({
            conversationId,
            status: ConversationStatus.processing,
            loaderText: 'Writing response...'
          })
          await appendMessage(MessageSender.assistant, [
            { type: 'text', text: finalText }
          ])
          await updateConversationStatus({
            conversationId,
            status: ConversationStatus.completed
          })
          return
        }

        break
      }

      llmMessages.push({
        role: 'assistant',
        content: [
          ...(result.text
            ? [{ type: 'text' as const, text: result.text }]
            : []),
          ...result.toolCalls.map((tc) => ({
            type: 'tool-call' as const,
            toolCallId: tc.id,
            toolName: tc.name,
            input: tc.args
          }))
        ]
      })

      for (const call of result.toolCalls) {
        const toolUseBlock: ToolUseBlock = {
          type: 'tool_use',
          id: call.id,
          name: call.name as ToolUseBlock['name'],
          input: call.args ?? {}
        }

        await appendMessage(MessageSender.assistant, [toolUseBlock], call.id)

        if (call.name === 'web_search_with_relevancy') {
          const toolQuery = String(call.args?.query ?? query)
          const toolSubQueries = Array.isArray(call.args?.subQueries)
            ? call.args.subQueries.map((item) => String(item))
            : undefined
          const toolResult = await handleWebSearchTool({
            conversationId,
            toolCallId: call.id,
            query: toolQuery,
            subQueries: toolSubQueries
          })

          await appendMessage(
            MessageSender.assistant,
            [toolResult.block],
            `tool-result-${call.id}`
          )
          llmMessages.push({
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: call.id,
                toolName: call.name,
                output: {
                  type: 'json',
                  value: toolResult.llmContent
                }
              }
            ]
          })
        } else if (call.name === 'fetch_web_page') {
          const toolResult = await handleFetchWebPage({
            conversationId,
            url: String(call.args?.url ?? ''),
            toolCallId: call.id
          })

          await appendMessage(
            MessageSender.assistant,
            [toolResult.block],
            `tool-result-${call.id}`
          )
          llmMessages.push({
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: call.id,
                toolName: call.name,
                output: {
                  type: 'json',
                  value: toolResult.block.content
                }
              }
            ]
          })
        } else {
          const errorResult: ToolResultBlock = {
            type: 'tool_result',
            tool_use_id: call.id,
            name: call.name,
            content: { error: 'Unknown tool' },
            is_error: true
          }
          await appendMessage(
            MessageSender.assistant,
            [errorResult],
            `tool-result-${call.id}`
          )
          llmMessages.push({
            role: 'tool',
            content: [
              {
                type: 'tool-result',
                toolCallId: call.id,
                toolName: call.name,
                output: {
                  type: 'error-json',
                  value: errorResult.content
                }
              }
            ]
          })
        }
      }
    }

    await appendMessage(MessageSender.assistant, [
      { type: 'text', text: 'Unable to complete research. Please try again.' }
    ])
    await updateConversationStatus({
      conversationId,
      status: ConversationStatus.failed
    })
  } catch (error) {
    await appendMessage(MessageSender.assistant, [
      { type: 'text', text: 'Research failed due to an unexpected error.' }
    ])
    await updateConversationStatus({
      conversationId,
      status: ConversationStatus.failed
    })
    throw error
  }
}

async function handleWebSearchTool(input: {
  conversationId: string
  toolCallId: string
  query: string
  subQueries?: string[]
}): Promise<{
  block: ToolResultBlock
  llmContent: WebSearchResult | ToolError
}> {
  try {
    await updateConversationStatus({
      conversationId: input.conversationId,
      status: ConversationStatus.processing,
      loaderText: 'Searching the web for sources...'
    })
    const normalized = (input.subQueries ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
    const subQueries = normalized.length > 0 ? normalized : [input.query]

    const childPromises = subQueries.map((subQuery, index) =>
      executeChild(subSearchWorkflow, {
        args: [
          {
            conversationId: input.conversationId,
            originalQuery: input.query,
            subQuery
          }
        ],
        taskQueue: TASK_QUEUE,
        workflowId: `${input.conversationId}-${input.toolCallId}-${index}`
      })
    )

    const settled = await Promise.allSettled(childPromises)
    const successes = settled.filter(
      (item): item is PromiseFulfilledResult<WebSearchResult> =>
        item.status === 'fulfilled'
    )

    if (successes.length / subQueries.length < 0.5) {
      const errorContent: ToolError = {
        error: 'Too many sub-searches failed. Try again with a different query.'
      }

      return {
        block: {
          type: 'tool_result',
          tool_use_id: input.toolCallId,
          name: 'web_search_with_relevancy',
          content: errorContent,
          is_error: true
        },
        llmContent: errorContent
      }
    }

    const combinedResults: WebSearchResult = {
      subQueries,
      results: successes.flatMap((item) => item.value.results ?? [])
    }

    const filteredForLlm: WebSearchResult = {
      subQueries,
      results: combinedResults.results.filter((result) => result.isRelevant)
    }

    return {
      block: {
        type: 'tool_result',
        tool_use_id: input.toolCallId,
        name: 'web_search_with_relevancy',
        content: combinedResults,
        is_error: false
      },
      llmContent: filteredForLlm
    }
  } catch (error) {
    const errorContent: ToolError = {
      error: error instanceof Error ? error.message : 'Web search failed'
    }

    return {
      block: {
        type: 'tool_result',
        tool_use_id: input.toolCallId,
        name: 'web_search_with_relevancy',
        content: errorContent,
        is_error: true
      },
      llmContent: errorContent
    }
  }
}

async function handleFetchWebPage(input: {
  conversationId: string
  toolCallId: string
  url: string
}): Promise<{ block: ToolResultBlock }> {
  try {
    await updateConversationStatus({
      conversationId: input.conversationId,
      status: ConversationStatus.processing,
      loaderText: 'Fetching source pages...'
    })
    const result = await executeFetchWebPage({ url: input.url })

    return {
      block: {
        type: 'tool_result',
        tool_use_id: input.toolCallId,
        name: 'fetch_web_page',
        content: result,
        is_error: false
      }
    }
  } catch (error) {
    const errorContent: ToolError = {
      error: error instanceof Error ? error.message : 'Invalid link'
    }

    return {
      block: {
        type: 'tool_result',
        tool_use_id: input.toolCallId,
        name: 'fetch_web_page',
        content: errorContent,
        is_error: true
      }
    }
  }
}
