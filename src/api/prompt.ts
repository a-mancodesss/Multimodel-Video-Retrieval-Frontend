import { apiUrl, readErrorMessage } from './client'
import type { StreamOutput } from './types'

function parseSseBlock(block: string): StreamOutput | null {
  const lines = block.split('\n').map((l) => l.trimEnd())
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const json = line.slice(5).trim()
      if (!json) continue
      try {
        return JSON.parse(json) as StreamOutput
      } catch {
        return null
      }
    }
  }
  return null
}

export async function postPromptStream(
  prompt: string,
  filename: string,
  onEvent: (event: StreamOutput) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(apiUrl('/prompt'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, filename }),
    signal,
  })

  if (!res.ok) throw new Error(await readErrorMessage(res))

  const reader = res.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const ev = parseSseBlock(trimmed)
      if (ev) onEvent(ev)
    }
  }

  const tail = buffer.trim()
  if (tail) {
    const ev = parseSseBlock(tail)
    if (ev) onEvent(ev)
  }
}
