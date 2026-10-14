import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import UnauthorizedPage from '@/pages/unauthorized-page'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nepsBg">
        <div className="text-nepsText">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'Administrator') {
    return <UnauthorizedPage />
  }

  return <>{children}</>
}

export default ProtectedRoute
