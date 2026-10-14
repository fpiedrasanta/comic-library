import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { formatDate } from '@/lib/date-utils'
import { getAdmins, deactivateAdmin, activateAdmin } from '../features/users/services/admin.service'
import type { AdminUserListItem } from '../types/auth'

type SortField = 'createdAt' | 'firstName' | 'lastName' | 'email'
type SortDir = 'asc' | 'desc'

function AdminsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = 'Dashboard &gt; Gestionar administradores'
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['admins', currentPage, pageSize, sortField, sortDir, search],
    queryFn: () =>
      getAdmins({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
      }),
  })

  const admins = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Gestión de Administradores')
    setPageActions(
      <button
        onClick={() => navigate('/admins/create')}
        className="bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-nepsPrimary/10 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuevo administrador</span>
      </button>
    )
  }, [setPageTitle, setPageActions, navigate])

  const visibleCount = useMemo(() => {
    const start = (currentPage - 1) * 12 + 1
    const end = Math.min(currentPage * 12, totalCount)
    return totalCount === 0 ? 0 : `${start}-${end}`
  }, [currentPage, totalCount])

  const handleEdit = (admin: AdminUserListItem) => {
    navigate(`/admins/${admin.id}/edit`, { state: { admin } })
  }

  const handleDeleteClick = (admin: AdminUserListItem) => {
    setDeleteTarget(admin)
    setSuccessMessage(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setActionError(null)

    try {
      await deactivateAdmin(deleteTarget.id)
      setSuccessMessage('Administrador desactivado')
      setDeleteTarget(null)
      setTimeout(() => setSuccessMessage(null), 3000)
      await queryClient.invalidateQueries({ queryKey: ['admins'] })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al desactivar el administrador.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReactivate = async (admin: AdminUserListItem) => {
    setActionError(null)
    try {
      await activateAdmin(admin.id)
      setSuccessMessage('Administrador reactivado')
      setTimeout(() => setSuccessMessage(null), 3000)
      await queryClient.invalidateQueries({ queryKey: ['admins'] })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al reactivar el administrador.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nepsBorder/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Usuarios Administradores</h2>
          <p className="text-xs text-nepsMuted mt-0.5">Consulta y gestiona las cuentas con privilegios de acceso y administración del Dashboard.</p>
        </div>
      </div>

      {queryError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {queryError instanceof Error ? queryError.message : 'Error al cargar los administradores.'}
        </div>
      )}

      {actionError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
          {successMessage}
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
        {isLoading ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">Cargando administradores...</div>
        ) : admins.length === 0 ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">No se encontraron administradores.</div>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className={`flex flex-col justify-between space-y-4 rounded-xl p-4 min-w-full sm:min-w-[380px] border transition-all ${
                admin.isActive
                  ? 'bg-nepsCard border-nepsBorder hover:border-nepsPrimary/60'
                  : 'opacity-70 bg-nepsCard/60 border-nepsBorder'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <ProtectedImage
                  src={admin.avatarUrl}
                  alt="Avatar"
                  className={`w-20 h-20 rounded-xl object-contain bg-nepsInput border border-nepsBorder flex-shrink-0 ${!admin.isActive ? 'grayscale' : ''}`}
                  fallback={
                    <div className="w-20 h-20 rounded-xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-xs">
                      Sin imagen
                    </div>
                  }
                />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    Nombre completo: <span className={`font-bold ${admin.isActive ? 'text-white' : 'text-slate-300'}`}>{admin.firstName} {admin.lastName}</span>
                  </p>
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    email: <span className={admin.isActive ? 'text-slate-300' : 'text-slate-400'}>{admin.email}</span>
                  </p>
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    País: <span className={admin.isActive ? 'text-slate-300' : 'text-slate-400'}>{admin.countryName || '—'}</span>
                  </p>
                  <p className="text-xs text-nepsMuted font-medium truncate">
                    Fecha de registro: <span className={admin.isActive ? 'text-slate-300' : 'text-slate-400'}>{formatDate(admin.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-nepsBorder/60 pt-3 flex items-center justify-between gap-2">
                {admin.isActive ? (
                  <>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full" title="Cuenta con acceso total al Dashboard">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Activo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="px-3 py-1.5 bg-nepsInput hover:bg-nepsBorder text-slate-200 font-semibold rounded-lg text-xs border border-nepsBorder transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5 text-nepsMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(admin)}
                        className="px-3 py-1.5 bg-nepsAccent/10 hover:bg-nepsAccent hover:text-white text-nepsAccent font-semibold rounded-lg text-xs border border-nepsAccent/20 transition-all flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span>Desactivar</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full" title="La cuenta no tiene acceso al Dashboard">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Inactivo</span>
                    </div>
                    <button
                      onClick={() => handleReactivate(admin)}
                      className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-lg text-xs border border-emerald-500/20 transition-all flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Reactivar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsPrimary/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{isLoading ? '...' : visibleCount}</strong> de <strong className="text-white">{totalCount}</strong> administradores
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

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsAccent/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsAccent/10 text-nepsAccent flex items-center justify-center flex-shrink-0 border border-nepsAccent/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Desactivar Administrador</h3>
                <p className="text-xs text-nepsMuted mt-1">
                  ¿Estás seguro que deseas desactivar a <strong className="text-white">{deleteTarget.firstName} {deleteTarget.lastName}</strong>?
                </p>
              </div>
            </div>

            <p className="text-[11px] text-nepsAccent/90 bg-nepsAccent/10 p-2.5 rounded-lg border border-nepsAccent/20">
              Esta acción revocará de forma inmediata el acceso de este usuario al Dashboard administrativo.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder/50 text-xs font-semibold text-slate-300 rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-nepsAccent hover:bg-rose-600 text-xs font-bold text-white rounded-xl shadow-lg shadow-nepsAccent/20 transition-all flex items-center gap-1.5 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Confirmar Desactivación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminsPage
