import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'

export default function RootRedirect() {
  const { authState } = useAuth()

  if (authState === 'initializing') {
    return (
      <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-neps-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-neps-muted">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  if (authState === 'authenticated') {
    return <Navigate to="/index" replace />
  }

  return <Navigate to="/login" replace />
}
