import { API_BASE_URL } from '../config/env'

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

export async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const j = JSON.parse(text) as { detail?: unknown }
    if (typeof j.detail === 'string') return j.detail
    if (Array.isArray(j.detail)) {
      return j.detail
        .map((d) => (typeof d === 'object' && d && 'msg' in d ? String((d as { msg: string }).msg) : String(d)))
        .join(', ')
    }
  } catch {
    /* plain text */
  }
  return text || `${res.status} ${res.statusText}`
}
