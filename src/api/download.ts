import { apiUrl } from './client'

export function downloadClipUrl(filename: string): string {
  const encoded = encodeURIComponent(filename)
  return apiUrl(`/download/${encoded}`)
}
