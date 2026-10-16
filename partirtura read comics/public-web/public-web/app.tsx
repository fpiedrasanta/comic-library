import { Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/features/authentication/hooks/use-auth'
import { publicRoutes, protectedRoutes } from '@/app/router/routes'
import { DashboardHeader, DashboardFooter } from '@/components/dashboard'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import ProtectedRoute from '@/app/router/protected-route'
import { ReaderPageRoute } from '@/features/reader/components/reader-page'
import { ListReaderPageRoute } from '@/features/reader/components/list-reader-page'

function AppLayout() {
  const { user, role } = useAuth()
  const displayName = user?.fullName || 'Usuario'
  const userRole = role || 'Lector'

  return (
    <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans relative flex flex-col">
      <div
        className="fixed top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden
      />
      <div
        className="fixed top-1/2 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_15%_50%,rgba(56,189,248,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden
      />

      <DashboardHeader
        userName={displayName}
        userEmail={user?.email || ''}
        avatarUrl={user?.avatarUrl}
        role={userRole}
        searchQuery={''}
        onSearchChange={() => {}}
      />

      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      <DashboardFooter />
    </div>
  )
}

function ReaderAppLayout() {
  return (
    <div className="fixed inset-0 bg-[#06080d] text-neps-text antialiased font-sans z-50 flex flex-col">
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route element={<AppLayout />}>
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
        <Route element={<ReaderAppLayout />}>
         <Route
           path="/works/:id/read"
           element={
             <ProtectedRoute>
               <ReaderPageRoute />
             </ProtectedRoute>
           }
         />
         <Route
           path="/lists/:listId/work/:workId"
           element={
             <ProtectedRoute>
               <ListReaderPageRoute />
             </ProtectedRoute>
           }
         />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App