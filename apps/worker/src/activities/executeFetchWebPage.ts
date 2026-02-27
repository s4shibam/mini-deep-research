import { load } from 'cheerio'

export async function executeFetchWebPage(input: {
  url: string
}): Promise<{ url: string; text: string }> {
  console.log('Fetch web page', { url: input.url })
  const validated = validateUrl(input.url)
  if (!validated.ok) {
    throw new Error(validated.error)
  }

  const controller = new AbortController()
  const timeoutMs = 60_000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(validated.url, {
      redirect: 'manual',
      headers: {
        'user-agent': 'mini-deep-research/1.0'
      },
      signal: controller.signal
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('fetch timeout')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

  if (response.status >= 300 && response.status < 400) {
    throw new Error('invalid link')
  }

  if (!response.ok) {
    throw new Error(`fetch failed (${response.status})`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('pdf')) {
    throw new Error('invalid link')
  }

  const html = await response.text()
  const $ = load(html)
  $('script, style, noscript').remove()

  const text = $('body').text()
  const cleaned = text.replace(/\s+/g, ' ').trim()

  return {
    url: validated.url,
    text: cleaned
  }
}

function validateUrl(raw: string): {
  ok: boolean
  url: string
  error?: string
} {
  try {
    const parsed = new URL(raw)
    if (!/https?:/.test(parsed.protocol)) {
      return { ok: false, url: raw, error: 'invalid link' }
    }
    if (parsed.pathname.toLowerCase().endsWith('.pdf')) {
      return { ok: false, url: raw, error: 'invalid link' }
    }
    return { ok: true, url: parsed.toString() }
  } catch {
    return { ok: false, url: raw, error: 'invalid link' }
  }
}
