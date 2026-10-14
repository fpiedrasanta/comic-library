import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import { useProtectedImage } from '@/hooks/use-protected-image'

interface UserMenuProps {
  userName: string
  userEmail: string
  avatarUrl?: string | null
  role?: string | null
}

export default function UserMenu({ userName, userEmail, avatarUrl, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const resolvedAvatar = useProtectedImage(avatarUrl)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-neps-card transition-all border border-transparent hover:border-neps-border group"
      >
        <div className="relative">
          {resolvedAvatar ? (
            <img
              src={resolvedAvatar}
              alt={userName}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-neps-primary/40 group-hover:ring-neps-primary transition-all"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-neps-primary/20 border border-neps-primary/40 flex items-center justify-center text-neps-primary text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-neps-bg" />
        </div>
        <div className="hidden md:block text-left pr-1">
          <p className="text-xs font-semibold text-white group-hover:text-neps-primary transition-colors">
            {userName}
          </p>
          <p className="text-[10px] text-neps-muted truncate max-w-[120px]">{role || 'Lector'}</p>
        </div>
        <svg
          className="w-4 h-4 text-neps-muted group-hover:text-white transition-colors hidden md:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neps-card border border-neps-border shadow-2xl py-2 z-50 backdrop-blur-xl">
          <div className="px-4 py-2 border-b border-neps-border mb-1">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-neps-muted truncate">{userEmail}</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-neps-text hover:bg-neps-input hover:text-neps-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-4 h-4 text-neps-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Editar Perfil
          </Link>
          <Link
            to="/library"
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-neps-text hover:bg-neps-input hover:text-neps-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-4 h-4 text-neps-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Mi Biblioteca
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-neps-text hover:bg-neps-input hover:text-neps-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-4 h-4 text-neps-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Configuración
          </Link>
          <div className="border-t border-neps-border my-1" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-2 text-xs text-neps-accent hover:bg-neps-accent/10 font-medium transition-colors w-full text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
