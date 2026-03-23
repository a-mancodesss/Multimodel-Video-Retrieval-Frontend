import { apiUrl, readErrorMessage } from './client'
import type { UploadResponse } from './types'

export async function uploadVideo(
  file: File,
  signal?: AbortSignal
): Promise<UploadResponse> {
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(apiUrl('/upload'), {
    method: 'POST',
    body,
    signal,
  })

  if (!res.ok) throw new Error(await readErrorMessage(res))
  return res.json() as Promise<UploadResponse>
}
