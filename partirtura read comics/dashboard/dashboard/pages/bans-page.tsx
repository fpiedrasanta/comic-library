import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import { useDashboardPageHeader } from '../pages/dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { getBans, deactivateBan } from '../features/bans/services/ban.service'
import { formatDate } from '@/lib/date-utils'
import type { Ban } from '../types/ban'

type SortField = 'createdAt' | 'firstName' | 'email' | 'startDate' | 'endDate'
type SortDir = 'asc' | 'desc'

function BansPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(48)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [deleteTarget, setDeleteTarget] = useState<Ban | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isActiveParam = useMemo(() => {
    if (activeFilter === 'si') return true
    if (activeFilter === 'no') return false
    return undefined
  }, [activeFilter])

  const { data, isLoading, error } = useQuery({
    queryKey: ['bans', currentPage, pageSize, sortField, sortDir, search, dateFrom, dateTo, activeFilter],
    queryFn: () =>
      getBans({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
        startDate: dateFrom ? moment(dateFrom).utc().toISOString() : undefined,
        endDate: dateTo ? moment(dateTo).utc().toISOString() : undefined,
        isActive: isActiveParam,
      }),
  })

  const bans = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Baneos')
    setPageActions(
      <button
        onClick={() => navigate('/bans/select-user')}
        className="bg-nepsAccent text-white hover:bg-rose-600 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-nepsAccent/20 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Crear Baneo</span>
      </button>
    )
  }, [setPageTitle, setPageActions, navigate])

  const getStatusBadge = (ban: Ban) => {
    if (ban.status === 'Revoked' || ban.status === 'Finished') {
      return (
        <div className="inline-flex items-center gap-1.5 bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Finalizado</span>
        </div>
      )
    }
    if (ban.endDate === null) {
      return (
        <div className="inline-flex items-center gap-1.5 bg-nepsAccent/10 border border-nepsAccent/20 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-nepsAccent"></span>
          <span className="text-[10px] font-bold text-nepsAccent uppercase tracking-wide">Activo (Perm)</span>
        </div>
      )
    }
    return (
      <div className="inline-flex items-center gap-1.5 bg-nepsAccent/10 border border-nepsAccent/20 px-2.5 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-nepsAccent animate-pulse"></span>
        <span className="text-[10px] font-bold text-nepsAccent uppercase tracking-wide">Activo</span>
      </div>
    )
  }

  const handleEdit = (ban: Ban) => {
    navigate(`/bans/${ban.id}/edit`, { state: { ban } })
  }

  const handleDeleteClick = (ban: Ban) => {
    setDeleteTarget(ban)
    setDeleteError(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deactivateBan(deleteTarget.id)
      setSuccessMessage('Baneo eliminado')
      setDeleteTarget(null)

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      await queryClient.invalidateQueries({ queryKey: ['bans'] })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el baneo.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-nepsCard border border-nepsBorder p-4 sm:p-5 rounded-2xl space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs pt-1 border-t border-nepsBorder/50">
          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Fecha desde:</label>
            <input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary color-scheme-dark"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Fecha hasta:</label>
            <input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary color-scheme-dark"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Baneos activos:</label>
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="">Todos</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Ordenar por:</label>
            <select
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as SortField)
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="createdAt">Fecha</option>
              <option value="firstName">Nombre</option>
              <option value="email">Correo</option>
              <option value="startDate">Fecha desde</option>
              <option value="endDate">Fecha hasta</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Dirección:</label>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as SortDir)
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {error instanceof Error ? error.message : 'Error al cargar los baneos.'}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
          {successMessage}
        </div>
      )}

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-nepsBorder bg-nepsInput/50 text-[11px] uppercase tracking-wider text-nepsMuted font-semibold">
                <th className="p-4">Usuario</th>
                <th className="p-4">Fecha Creación</th>
                <th className="p-4">Vigencia (Desde - Hasta)</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nepsBorder text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-nepsMuted">
                    Cargando baneos...
                  </td>
                </tr>
              ) : bans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-nepsMuted">
                    No se encontraron registros de baneo.
                  </td>
                </tr>
              ) : (
                bans.map((ban) => (
                  <tr key={ban.id} className="hover:bg-nepsInput/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProtectedImage
                          src={ban.avatarUrl}
                          alt="Avatar"
                          className="w-10 h-10 rounded-xl object-contain bg-nepsInput border border-nepsBorder flex-shrink-0"
                          fallback={
                            <div className="w-10 h-10 rounded-xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px]">
                              Sin imagen
                            </div>
                          }
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{ban.firstName} {ban.lastName}</p>
                          <p className="text-[11px] text-nepsMuted truncate">{ban.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium whitespace-nowrap">
                      {formatDate(ban.createdAt)}
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">
                      <div className="flex flex-col text-[11px]">
                        <span>
                          <strong className="text-nepsMuted">Desde:</strong> {moment.utc(ban.startDate).local().format('DD/MM/YYYY HH:mm')}
                        </span>
                        <span>
                          <strong className="text-nepsMuted">Hasta:</strong>{' '}
                          {ban.endDate ? moment.utc(ban.endDate).local().format('DD/MM/YYYY HH:mm') : 'Permanente (Sin límite)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">{getStatusBadge(ban)}</td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button className="p-1.5 text-nepsMuted hover:text-nepsPrimary hover:bg-nepsInput rounded-lg transition-colors" title="Ver detalle">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button onClick={() => handleEdit(ban)} className="p-1.5 text-nepsMuted hover:text-white hover:bg-nepsInput rounded-lg transition-colors" title="Editar baneo">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ban)}
                        className="p-1.5 text-nepsMuted hover:text-nepsAccent hover:bg-nepsAccent/10 rounded-lg transition-colors"
                        title="Revocar baneo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {bans.length === 0 && !isLoading && !error && (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-white">No se encontraron registros de baneo</h4>
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">
              No hay baneos que coincidan con la búsqueda o los filtros aplicados. Intentá ajustar los criterios.
            </p>
          </div>
        )}
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsAccent/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{isLoading ? '...' : bans.length}</strong> de <strong className="text-white">{totalCount}</strong> baneos registrados
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
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsAccent/10 text-nepsAccent flex items-center justify-center flex-shrink-0 border border-nepsAccent/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  ¿Estás seguro que deseas eliminar el baneo vigente de {deleteTarget.firstName} {deleteTarget.lastName}?
                </h3>
                <p className="text-xs text-nepsMuted mt-1">
                  Esta acción revocará el baneo actual. El registro histórico se conservará para auditoría.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-xl p-3 text-xs text-nepsAccent">
                {deleteError}
              </div>
            )}

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
                    <span>Revocando...</span>
                  </>
                ) : (
                  <span>Confirmar Eliminación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BansPage
