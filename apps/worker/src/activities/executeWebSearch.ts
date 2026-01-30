import { Exa } from 'exa-js'
import { EXA_MOCK_RESULTS } from '../exa-mock-data'

export async function executeWebSearch(input: {
  subQuery: string
}): Promise<Array<{ url: string; title?: string; snippet?: string }>> {
  console.log('EXA search', { subQuery: input.subQuery })
  return searchExa(input.subQuery)
}

async function searchExa(
  query: string
): Promise<Array<{ url: string; title?: string; snippet?: string }>> {
  const useMock = process.env.MOCK_EXA === 'true'
  if (useMock) {
    return EXA_MOCK_RESULTS
  }

  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    throw new Error('Missing EXA_API_KEY')
  }

  const exa = new Exa(apiKey)

  const response = await exa.search(query, {
    numResults: 10,
    contents: {
      text: { maxCharacters: 500 }
    }
  })

  const results = response.results.map((result) => ({
    url: result.url,
    title: result.title ?? undefined,
    snippet: result.text ?? undefined
  }))

  console.log('\x1b[35m%s\x1b[0m', 'EXA results')
  console.log(results)

  return results
}
