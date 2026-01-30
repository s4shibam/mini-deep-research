import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { RELEVANCY_EVALUATOR_PROMPT } from '../prompts'

const SMALL_MODEL = 'gpt-4o-mini'

export async function assessResultRelevance(input: {
  originalQuery: string
  title?: string
  url: string
  snippet?: string
}): Promise<{ isRelevant: boolean; reason?: string }> {
  const userPrompt = `Evaluate this search result:

Research Question: "${input.originalQuery}"

Search Result:
- Title: ${input.title ?? 'N/A'}
- URL: ${input.url}
- Snippet: ${input.snippet ?? 'N/A'}

Provide your evaluation as JSON: {"isRelevant": boolean, "reasoning": string}`

  const result = await generateText({
    model: openai(SMALL_MODEL),
    system: RELEVANCY_EVALUATOR_PROMPT,
    prompt: userPrompt,
    temperature: 0.1
  })

  const parsed = safeParseJsonObject(result.text ?? '')
  if (typeof parsed.isRelevant === 'boolean') {
    return {
      isRelevant: parsed.isRelevant,
      reason:
        typeof parsed.reasoning === 'string' ? parsed.reasoning : undefined
    }
  }

  return { isRelevant: false, reason: 'Unable to determine relevance.' }
}

function safeParseJsonObject(input: string): Record<string, any> {
  const trimmed = input.trim()
  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, any>
    }
  } catch {
    // Silently fail
  }

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const parsed = JSON.parse(trimmed.slice(start, end + 1))
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, any>
      }
    } catch {
      // Silently fail
    }
  }

  return {}
}
