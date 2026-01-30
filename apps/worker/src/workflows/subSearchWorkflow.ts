import type { SubSearchInput, WebSearchResult } from '@repo/types'
import {
  executeWebSearch,
  assessResultRelevance,
  executeFetchWebPage
} from './activityProxies'

export async function subSearchWorkflow(
  input: SubSearchInput
): Promise<WebSearchResult> {
  const results = await executeWebSearch({ subQuery: input.subQuery })

  const relevanceSettled = await Promise.allSettled(
    results.map((result) =>
      assessResultRelevance({
        originalQuery: input.originalQuery,
        title: result.title,
        url: result.url,
        snippet: result.snippet
      })
    )
  )

  const scoredResults: WebSearchResult['results'] = results.map(
    (result, index) => {
      const settled = relevanceSettled[index]
      if (settled?.status === 'fulfilled') {
        return {
          url: result.url,
          title: result.title ?? 'Untitled',
          snippet: result.snippet ?? '',
          isRelevant: settled.value.isRelevant,
          reason: settled.value.reason
        }
      }

      const reason =
        settled && 'reason' in settled
          ? settled.reason instanceof Error
            ? settled.reason.message
            : 'Relevance check failed.'
          : 'Relevance check failed.'

      return {
        url: result.url,
        title: result.title ?? 'Untitled',
        snippet: result.snippet ?? '',
        isRelevant: false,
        reason
      }
    }
  )

  const relevantResults = scoredResults.filter((result) => result.isRelevant)
  const fetchSettled = await Promise.allSettled(
    relevantResults.map((result) => executeFetchWebPage({ url: result.url }))
  )

  const pageTextByUrl = new Map<string, { text?: string; error?: string }>()
  fetchSettled.forEach((settled, index) => {
    const url = relevantResults[index]?.url
    if (!url) {
      return
    }

    if (settled.status === 'fulfilled') {
      pageTextByUrl.set(url, { text: settled.value.text })
      return
    }

    const errorMessage =
      settled.reason instanceof Error
        ? settled.reason.message
        : 'Failed to fetch page.'
    pageTextByUrl.set(url, { error: errorMessage })
  })

  const enrichedResults = scoredResults.map((result) => {
    if (!result.isRelevant) {
      return result
    }

    const fetched = pageTextByUrl.get(result.url)
    if (!fetched) {
      return result
    }

    return {
      ...result,
      pageText: fetched.text,
      pageTextError: fetched.error
    }
  })

  return {
    subQueries: [input.subQuery],
    results: enrichedResults
  }
}
