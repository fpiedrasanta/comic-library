import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../features/authentication/hooks/use-auth'
import { getUsers, getUserById } from '../features/users/services/user.service'
import { ProtectedImage } from '../components/protected-image'
import { useDashboardPageHeader } from '../pages/dashboard-layout'
import { formatDate } from '@/lib/date-utils'
import type { UserListItem, UserDetail } from '../types/auth'

type SortField = 'lastName' | 'createdAt' | 'banCount'
type SortDir = 'asc' | 'desc'

function UsersPage() {
  const { isLoading: authLoading } = useAuth()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [isBannedFilter, setIsBannedFilter] = useState<boolean | undefined>(undefined)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = 'Dashboard &gt; Gestionar usuarios'
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', currentPage, pageSize, sortField, sortDir, search, isActiveFilter, isBannedFilter],
    queryFn: () =>
      getUsers({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
        isActive: isActiveFilter,
        isBanned: isBannedFilter,
      }),
    enabled: !authLoading,
  })

  const users = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  useEffect(() => {
    setPageTitle('Consulta de Usuarios')
    setPageActions(
      <span className="text-[11px] text-nepsMuted bg-nepsCard px-2.5 py-1 rounded-md border border-nepsBorder">
        Modo Lectura (Solo Consulta)
      </span>
    )
  }, [setPageTitle, setPageActions])

  const handleUserClick = async (userId: number) => {
    try {
      const detail = await getUserById(userId)
      setSelectedUser(detail)
      setIsModalOpen(true)
    } catch {
      // Error handling
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const getStatusBadge = (user: UserListItem) => {
    if (!user.isActive) {
      return (
        <div className="flex items-center gap-1.5 bg-nepsAccent/10 border border-nepsAccent/20 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-nepsAccent"></span>
          <span className="text-[10px] font-bold text-nepsAccent uppercase tracking-wide">Inactive</span>
        </div>
      )
    }
    if (user.isBanned) {
      return (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Temp Ban</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Active</span>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-nepsBg">
        <div className="text-nepsText">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
        {error instanceof Error ? error.message : 'Error al cargar los usuarios.'}
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-nepsCard border border-nepsBorder p-4 rounded-2xl space-y-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
          <svg className="w-4 h-4 text-nepsMuted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Activos:</label>
              <select
                value={isActiveFilter === undefined ? '' : isActiveFilter ? 'si' : 'no'}
                onChange={(e) => {
                  const val = e.target.value
                  setIsActiveFilter(val === '' ? undefined : val === 'si')
                  setCurrentPage(1)
                }}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="">Todos</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Baneados:</label>
              <select
                value={isBannedFilter === undefined ? '' : isBannedFilter ? 'si' : 'no'}
                onChange={(e) => {
                  const val = e.target.value
                  setIsBannedFilter(val === '' ? undefined : val === 'si')
                  setCurrentPage(1)
                }}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="">Todos</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 border-nepsBorder/60 pt-2 sm:pt-0 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Ordenar por:</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="lastName">Apellido</option>
                <option value="createdAt">Fecha de registro</option>
                <option value="banCount">Cantidad baneos</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Dirección:</label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as SortDir)}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-4">
        {isLoading && users.length === 0 ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">No se encontraron usuarios.</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className="cursor-pointer bg-nepsCard border border-nepsBorder rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-nepsBorder/80 transition-all min-w-full sm:min-w-[380px]"
            >
              <div className="flex items-center gap-3.5">
                <ProtectedImage
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-xl object-contain bg-nepsInput border border-nepsBorder flex-shrink-0"
                  fallback={
                    <div className="w-20 h-20 rounded-xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-xs">
                      Sin imagen
                    </div>
                  }
                />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    Nombre completo: <span className="text-white font-bold">{user.firstName} {user.lastName}</span>
                  </p>
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    email: <span className="text-slate-300">{user.email}</span>
                  </p>
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    Nacionalidad: <span className="text-slate-300">{user.countryName || '—'}</span>
                  </p>
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    Fecha de registro: <span className="text-slate-300">{formatDate(user.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-nepsBorder/60 pt-3 flex items-center justify-between text-xs">
                <span className="text-nepsMuted text-[11px]">
                  Cantidad baneos: <strong className="text-white">{user.banCount}</strong>
                </span>
                {getStatusBadge(user)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsPrimary/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{users.length}</strong> de <strong className="text-white">{totalCount}</strong> usuarios
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-nepsInput border border-nepsBorder rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Primera página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-nepsInput border border-nepsBorder px-3 py-1 rounded-xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nepsMuted">Pág.</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page)
                }
              }}
              className="w-10 text-center bg-nepsBg border border-nepsBorder focus:border-nepsPrimary text-xs font-bold text-nepsPrimary py-1 rounded-md outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs text-nepsMuted font-medium">/ {totalPages}</span>
          </div>

          <div className="flex items-center bg-nepsInput border border-nepsBorder rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Última página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
              </svg>
            </button>
          </div>
         </div>
       </div>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3.5 border-b border-nepsBorder flex items-center justify-between bg-nepsInput/50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-nepsPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs font-bold text-white tracking-tight">Inspección de Avatar</span>
              </div>
              <button onClick={closeModal} className="text-nepsMuted hover:text-white p-1 rounded-lg hover:bg-nepsBorder/50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 bg-nepsBg/50 flex items-center justify-center border-b border-nepsBorder min-h-[250px] max-h-[60vh] overflow-hidden">
              <ProtectedImage
                src={selectedUser.avatarUrl}
                alt="Avatar Zoom"
                className="max-h-[50vh] w-auto object-contain rounded-lg border border-nepsBorder/80 shadow-md"
                fallback={
                  <div className="text-nepsMuted text-xs">Sin imagen</div>
                }
              />
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-xs text-nepsMuted">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-nepsBorder/60 pt-3 text-nepsMuted">
                <div>Nacionalidad: <strong className="text-slate-200">{selectedUser.countryName || '—'}</strong></div>
                <div>ID: <strong className="text-slate-200">{selectedUser.id}</strong></div>
              </div>
            </div>
          </div>
         </div>
      )}
    </>
  )
}

export default UsersPage
