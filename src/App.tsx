import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-provider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { MainPage } from './pages/MainPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<MainPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
