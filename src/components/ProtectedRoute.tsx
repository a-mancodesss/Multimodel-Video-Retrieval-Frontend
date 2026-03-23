import { Navigate, useLocation } from 'react-router-dom'
import { authRequired } from '../config/env'
import { useAuth } from '../hooks/use-auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (authRequired && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
