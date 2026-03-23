/** Base URL for API (e.g. `/api` with Vite proxy, or `http://127.0.0.1:5050`). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api'

/** When set, login is required before app routes. */
export const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD ?? ''

export const authRequired = AUTH_PASSWORD.length > 0
