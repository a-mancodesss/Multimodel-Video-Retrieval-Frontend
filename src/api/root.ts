import { apiUrl, readErrorMessage } from './client'

export async function fetchIntro(signal?: AbortSignal): Promise<string> {
  const res = await fetch(apiUrl('/'), { signal })
  if (!res.ok) throw new Error(await readErrorMessage(res))
  return res.text()
}
