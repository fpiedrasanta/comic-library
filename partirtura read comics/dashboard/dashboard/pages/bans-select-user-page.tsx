import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardPageHeader } from '../pages/dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { formatDate } from '@/lib/date-utils'
import { useQuery } from '@tanstack/react-query'
import { getActiveUsersForBan } from '../features/bans/services/ban.service'
import type { UserListItem } from '../types/auth'

type SortField = 'createdAt' | 'firstName' | 'lastName' | 'email'
type SortDir = 'asc' | 'desc'

function BansSelectUserPage() {
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(48)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { data, isLoading, error } = useQuery({
    queryKey: ['active-users-for-ban', currentPage, pageSize, sortField, sortDir, search],
    queryFn: () =>
      getActiveUsersForBan({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
      }),
  })

  const users = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Crear Nuevo Baneo')
    setPageActions(
      <>
        <button
          onClick={() => navigate('/bans')}
          className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:block">Volver a Baneos</span>
        </button>
        <span className="text-[11px] text-nepsPrimary bg-nepsPrimary/10 px-2.5 py-1 rounded-md border border-nepsPrimary/20 font-semibold">
          Paso 1 de 2: Seleccionar Usuario
        </span>
      </>
    )
  }, [setPageTitle, setPageActions, navigate])

  const handleSelectUser = (user: UserListItem) => {
    if (user.isBanned) return
    navigate('/bans/create', { state: { selectedUser: user } })
  }

  const getStatusBadge = (user: UserListItem) => {
    if (user.isBanned) {
      return (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Temp Ban Activo</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Seleccionable</span>
      </div>
    )
  }

  const visibleCount = useMemo(() => {
    const start = (currentPage - 1) * 48 + 1
    const end = Math.min(currentPage * 48, totalCount)
    return totalCount === 0 ? 0 : `${start}-${end}`
  }, [currentPage, totalCount])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nepsBorder/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Selección de Usuario Activo</h2>
          <p className="text-xs text-nepsMuted mt-0.5">
            Busca y elige al usuario al que aplicarás el baneo. Los usuarios con sanciones activas se encuentran bloqueados.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {error instanceof Error ? error.message : 'Error al cargar los usuarios.'}
        </div>
      )}

      <div className="bg-nepsCard border border-nepsBorder p-4 rounded-2xl space-y-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
          <svg className="w-4 h-4 text-nepsMuted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Ordenar por:</label>
              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value as SortField)
                  setCurrentPage(1)
                }}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="createdAt">Fecha de registro</option>
                <option value="firstName">Nombre</option>
                <option value="lastName">Apellido</option>
                <option value="email">Correo</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Dirección:</label>
              <select
                value={sortDir}
                onChange={(e) => {
                  setSortDir(e.target.value as SortDir)
                  setCurrentPage(1)
                }}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-4">
        {isLoading && users.length === 0 ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">
            No se encontraron usuarios activos sin ban vigente.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`flex flex-col justify-between space-y-4 rounded-xl p-4 min-w-full sm:min-w-[380px] border transition-all ${
                user.isBanned
                  ? 'opacity-70 bg-nepsCard/60 border-amber-500/30'
                  : 'bg-nepsCard border-nepsBorder hover:border-nepsPrimary/60'
              }`}
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

              <div className="border-t border-nepsBorder/60 pt-3 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-nepsMuted text-[11px]">
                    Cantidad baneos: <strong className={user.isBanned ? 'text-amber-400' : 'text-white'}>{user.banCount}</strong>
                  </span>
                  {getStatusBadge(user)}
                </div>

                <button
                  onClick={() => handleSelectUser(user)}
                  disabled={user.isBanned}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 font-semibold rounded-lg text-xs transition-all ${
                    user.isBanned
                      ? 'bg-slate-800/80 text-nepsMuted border border-nepsBorder cursor-not-allowed'
                      : 'bg-nepsPrimary/10 text-nepsPrimary hover:bg-nepsPrimary hover:text-slate-950 border border-nepsPrimary/30'
                  }`}
                >
                  {user.isBanned ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Baneo Vigente (No seleccionable)</span>
                    </>
                  ) : (
                    <>
                      <span>Seleccionar Usuario</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsPrimary/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{isLoading ? '...' : visibleCount}</strong> de <strong className="text-white">{totalCount}</strong> usuarios activos
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-nepsInput border border-nepsBorder rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isLoading}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Primera página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
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
              disabled={currentPage === totalPages || isLoading}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isLoading}
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
    </div>
  )
}

export default BansSelectUserPage
