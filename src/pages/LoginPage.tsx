import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authRequired } from '../config/env'
import { useAuth } from '../hooks/use-auth'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [formError, setFormError] = useState('')

  if (!authRequired) {
    return <Navigate to="/" replace />
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function handleLogin(password: string): boolean {
    const ok = login(password)
    if (!ok) setFormError('Invalid password.')
    else setFormError('')
    return ok
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-[#09090b] text-[#fafafa] overflow-hidden selection:bg-white/20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-[#18181b] rounded-2xl mb-5 border border-white/[0.05] shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-[#a1a1aa]">Enter your secure password to access the retrieval engine.</p>
        </div>
        
        <LoginForm onSubmit={handleLogin} error={formError} />
      </div>
    </div>
  )
}
