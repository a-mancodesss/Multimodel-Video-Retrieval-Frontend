export type AuthContextValue = {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}
