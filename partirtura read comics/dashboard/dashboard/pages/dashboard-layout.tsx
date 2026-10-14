import { useState, createContext, useContext, type ReactNode } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/authentication/hooks/use-auth'
import { ToastProvider } from '../contexts/toast-context'
import Toaster from '../components/ui/toaster'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Ban,
  ShieldCheck,
  BadgeCheck,
  Globe,
  BookOpen,
  Star,
  Layers,
  Hash,
  User,
  Tags,
  List,
} from 'lucide-react'

interface DashboardPageHeaderContextValue {
  pageTitle: string
  setPageTitle: (title: string) => void
  pageActions: ReactNode
  setPageActions: (actions: ReactNode) => void
}

export const DashboardPageHeaderContext = createContext<DashboardPageHeaderContextValue | undefined>(undefined)

function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pageTitle, setPageTitle] = useState('Consola de Administración')
  const [pageActions, setPageActions] = useState<ReactNode>(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD'

  return (
    <ToastProvider>
      <DashboardPageHeaderContext.Provider value={{ pageTitle, setPageTitle, pageActions, setPageActions }}>
        <div className="flex h-screen bg-nepsBg text-nepsText font-sans overflow-hidden">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:flex w-64 bg-nepsCard border-r border-nepsBorder flex-col justify-between z-30">
            <div>
              <div className="h-16 flex items-center px-6 border-b border-nepsBorder gap-2">
                <div className="text-xl font-bold text-white tracking-tight">&lt;neps<span className="text-nepsAccent">/</span>&gt;</div>
                <span className="text-[10px] bg-nepsAccent/10 text-nepsAccent px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-nepsAccent/20">Admin</span>
              </div>

              <nav className="p-4 space-y-1">
                <p className="px-3 text-[10px] font-bold text-nepsMuted uppercase tracking-wider mb-2">Módulos</p>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                        : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  General
                </NavLink>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                        : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                    }`
                  }
                >
                  <Users className="w-4 h-4" />
                  Usuarios
                </NavLink>
                <NavLink
                  to="/persons"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                        : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                    }`
                  }
                >
                  <User className="w-4 h-4" />
                  Personas
                </NavLink>
                <NavLink
                  to="/roles"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                        : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                    }`
                  }
                >
                  <BadgeCheck className="w-4 h-4" />
                  Roles
                </NavLink>
                <NavLink
                  to="/tags"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                        : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                    }`
                  }
                >
                <Tags className="w-4 h-4" />
                Etiquetas
              </NavLink>
              <NavLink
                to="/list-types"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <List className="w-4 h-4" />
                Tipos de Lista
              </NavLink>
                <NavLink
                  to="/work-lists"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Layers className="w-4 h-4" />
                Listas de Obras
              </NavLink>
                <NavLink
                  to="/admins"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                Administradores
              </NavLink>
                <NavLink
                  to="/countries"
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Globe className="w-4 h-4" />
                Países
              </NavLink>
                <NavLink
                  to="/publishers"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <BookOpen className="w-4 h-4" />
                Editoriales
              </NavLink>
                <NavLink
                  to="/franchises"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Star className="w-4 h-4" />
                Franquicias
              </NavLink>
                <NavLink
                  to="/series"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Layers className="w-4 h-4" />
                Series
              </NavLink>
                <NavLink
                  to="/works"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Hash className="w-4 h-4" />
                Obras
              </NavLink>
                <NavLink
                  to="/bans"
                  end
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Ban className="w-4 h-4" />
                Baneos
              </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20'
                      : 'text-nepsMuted hover:text-white hover:bg-nepsInput'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                Ajustes
              </NavLink>
            </nav>
          </div>

          <div className="p-4 border-t border-nepsBorder flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-nepsPrimary/20 text-nepsPrimary font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-[10px] text-nepsMuted truncate">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="text-nepsMuted hover:text-nepsAccent p-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full pt-14 md:pt-0">
          <header className="h-16 flex-shrink-0 border-b border-nepsBorder bg-nepsBg/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p id="breadcum" className="text-[11px] text-nepsMuted">Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              {pageActions}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </DashboardPageHeaderContext.Provider>
    </ToastProvider>
  )
}

export default DashboardLayout

export function useDashboardPageHeader() {
  const context = useContext(DashboardPageHeaderContext)
  if (!context) {
    throw new Error('useDashboardPageHeader must be used within a DashboardLayout')
  }
  return context
}
