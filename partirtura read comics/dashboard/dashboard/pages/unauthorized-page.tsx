import { useAuth } from '@/features/authentication/hooks/use-auth'

const PUBLIC_WEB_URL = import.meta.env.VITE_PUBLIC_WEB_URL || 'http://localhost:5173'

function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <div className="h-full bg-nepsBg font-sans flex flex-col justify-between relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-white">&lt;neps<span className="text-nepsAccent">/</span>&gt;</div>
            <span className="text-xs uppercase tracking-widest text-nepsMuted font-semibold border-l border-nepsBorder pl-3 ml-1">Admin Control Panel</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-nepsCard border border-nepsBorder rounded-2xl p-6 sm:p-8 shadow-glow-blue space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nepsAccent/10 text-nepsAccent border border-nepsAccent/20 mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Acceso rechazado</h1>
          <p className="text-xs text-nepsMuted">No tenés permisos para acceder al panel de administración.</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={logout}
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-nepsBorder px-4 py-2.5 text-sm font-medium text-white hover:bg-nepsSurface transition-colors"
            >
              Cerrar sesión
            </button>
            <a
              href={PUBLIC_WEB_URL}
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-nepsAccent px-4 py-2.5 text-sm font-medium text-nepsAccent hover:bg-nepsAccent/10 transition-colors"
            >
              Ir al sitio público
            </a>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-nepsMuted border-t border-nepsBorder/50">
        &copy; 2026 Comic Library Admin. Sistema Privado.
      </footer>
    </div>
  )
}

export default UnauthorizedPage
