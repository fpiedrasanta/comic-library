import { useNavigate, useLocation, Link } from 'react-router-dom'
import UserMenu from '@/features/authentication/components/user-menu'
import { CatalogMenu, MobileNav } from './catalog-menu'

interface DashboardHeaderProps {
  userName: string
  userEmail: string
  avatarUrl?: string | null
  role?: string | null
  searchQuery: string
  onSearchChange: (value: string) => void
}

export default function DashboardHeader({
  userName,
  userEmail,
  avatarUrl,
  role,
  searchQuery,
  onSearchChange,
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="border-b border-neps-border bg-neps-bg/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <div className="text-2xl font-bold tracking-tight text-white transition-transform group-hover:scale-105">
              &lt;neps<span className="text-neps-accent">/</span>&gt;
            </div>
            <span className="text-xs uppercase tracking-widest text-neps-muted font-semibold hidden md:inline-block border-l border-neps-border pl-3 ml-1">
              Comic Library
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            <Link
              to="/index"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/index'
                  ? 'bg-neps-card text-neps-primary border border-neps-primary/30'
                  : 'text-neps-muted hover:text-white hover:bg-neps-card'
              }`}
            >
              Inicio
            </Link>
            {/*
              Mi Colección and Wishlist used to sit here as top-level buttons
              pointing at routes that do not exist. They are now sections of the
              catalog menu, listed as disabled until their pages exist.
            */}
            <CatalogMenu />
          </nav>
        </div>

        <div className="lg:hidden">
          <MobileNav />
        </div>

        <div className="flex-1 max-w-md relative hidden sm:block">
          <input
            type="text"
            placeholder="Buscar cómics, autores, números..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-neps-text placeholder-slate-600 rounded-lg pl-9 pr-4 py-1.5 text-xs outline-none transition-all duration-200"
          />
          <svg
            className="w-4 h-4 text-neps-muted absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative p-2 text-neps-muted hover:text-white rounded-lg hover:bg-neps-card transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neps-accent" />
          </button>

          <div className="h-6 w-px bg-neps-border" />

          <UserMenu userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} role={role} />
        </div>
      </div>
    </header>
  )
}
