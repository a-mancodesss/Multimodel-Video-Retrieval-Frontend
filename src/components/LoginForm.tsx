import { useState, type FormEvent } from 'react'

type LoginFormProps = {
  onSubmit: (password: string) => boolean
  error?: string
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [password, setPassword] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(password)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className={`relative flex items-center bg-[#09090b] border rounded-xl overflow-hidden transition-all duration-300 ${
          isFocused ? 'border-white/30 ring-1 ring-white/30' : 'border-[#27272a]'
        }`}>
          <div className="pl-4 pr-2 text-[#a1a1aa]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent py-4 pr-4 text-sm text-white placeholder:text-[#a1a1aa] focus:outline-none"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 animate-in slide-in-from-top-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-white text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all hover:bg-white/90 active:scale-[0.98] mt-2"
      >
        <span>Sign In</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>
    </form>
  )
}
