import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { getFranchises, deactivateFranchise, activateFranchise } from '../features/franchises/services/franchise.service'
import type { FranchiseListItemDto } from '../types/franchise'

type SortField = 'name' | 'publisherCountryName' | 'publisherName'
type SortDir = 'asc' | 'desc'
type ModalMode = 'deactivate' | 'activate' | null

const FRANCHISE_SESSION_KEYS = [
  'franchise-form-edit-',
  'franchise-form-values-',
  'franchise-form-publisher-',
  'franchise-form-image-',
] as const

function FranchisesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const clearFranchiseSessionStorage = () => {
    if (typeof sessionStorage === 'undefined') return
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && FRANCHISE_SESSION_KEYS.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key))
  }

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = 'Dashboard &gt; Gestionar franquicias'
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
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<boolean | undefined>(undefined)
  const [isOngoingFilter, setIsOngoingFilter] = useState<boolean | undefined>(undefined)
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseListItemDto | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['franchises', currentPage, pageSize, sortField, sortDir, search, isActiveFilter, isFeaturedFilter, isOngoingFilter],
    queryFn: () =>
      getFranchises({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
        isActive: isActiveFilter,
        isFeatured: isFeaturedFilter,
        isOngoing: isOngoingFilter,
      }),
  })

  useEffect(() => {
    clearFranchiseSessionStorage()
  }, [])

  const franchises = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Franquicias')
    setPageActions(
      <button
        onClick={() => navigate('/franchises/select-publisher')}
        className="bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-nepsPrimary/10 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        <span>Nueva Franquicia</span>
      </button>
    )
  }, [setPageTitle, setPageActions, navigate])

  const handleEdit = (franchise: FranchiseListItemDto) => {
    navigate(`/franchises/${franchise.id}/edit`)
  }

  const handleManageWorks = (franchise: FranchiseListItemDto) => {
    navigate(`/franchises/${franchise.id}/works`)
  }

  const handleDeactivate = (franchise: FranchiseListItemDto) => {
    setSelectedFranchise(franchise)
    setModalMode('deactivate')
  }

  const handleActivate = (franchise: FranchiseListItemDto) => {
    setSelectedFranchise(franchise)
    setModalMode('activate')
  }

  const confirmAction = async () => {
    if (!selectedFranchise || !modalMode) return

    setIsSaving(true)
    try {
      if (modalMode === 'deactivate') {
        await deactivateFranchise(selectedFranchise.id)
        setSuccessMessage(`Franquicia "${selectedFranchise.name}" desactivada.`)
      } else {
        await activateFranchise(selectedFranchise.id)
        setSuccessMessage(`Franquicia "${selectedFranchise.name}" reactivada.`)
      }

      queryClient.invalidateQueries({ queryKey: ['franchises'] })
    } catch {
      setServerError('Error al procesar la operación. Por favor, reintentá.')
    } finally {
      setIsSaving(false)
      setModalMode(null)
      setSelectedFranchise(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const getStatusBadge = (franchise: FranchiseListItemDto) => {
    if (!franchise.isActive) {
      return (
        <span className="text-[9px] bg-nepsAccent/20 text-nepsAccent px-1.5 py-0.2 rounded font-bold uppercase ml-1.5 border border-nepsAccent/30">
          Inactiva
        </span>
      )
    }
    return null
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-2xl p-4 text-xs text-nepsAccent">
          Error al cargar las franquicias.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-xs text-emerald-300 font-medium">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-nepsMuted hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {serverError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-nepsAccent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-nepsAccent">Error al procesar la operación</p>
              <p className="text-nepsMuted">{serverError}</p>
            </div>
          </div>
          <button onClick={() => setServerError(null)} className="text-nepsMuted hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nepsMuted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar franquicia por nombre, editorial o país..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-nepsBorder/60">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Destacadas</label>
            <select
              value={isFeaturedFilter === undefined ? 'todas' : isFeaturedFilter ? 'si' : 'no'}
              onChange={(e) => {
                const val = e.target.value
                setIsFeaturedFilter(val === 'todas' ? undefined : val === 'si')
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="todas">Todas</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Vigentes</label>
            <select
              value={isOngoingFilter === undefined ? 'todas' : isOngoingFilter ? 'si' : 'no'}
              onChange={(e) => {
                const val = e.target.value
                setIsOngoingFilter(val === 'todas' ? undefined : val === 'si')
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="todas">Todas</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Activas</label>
            <select
              value={isActiveFilter === undefined ? 'todas' : isActiveFilter ? 'si' : 'no'}
              onChange={(e) => {
                const val = e.target.value
                setIsActiveFilter(val === 'todas' ? undefined : val === 'si')
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="todas">Todas</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Ordenar por</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="name">Nombre</option>
              <option value="publisherCountryName">País de la editorial</option>
              <option value="publisherName">Editorial</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Dirección</label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDir)}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl">
        {isLoading && franchises.length === 0 ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-8 bg-nepsInput rounded-xl w-full"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-nepsInput rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : franchises.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-white">No se encontraron franquicias</h3>
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">No hay registros que coincidan con los criterios de búsqueda o filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nepsBorder bg-nepsInput/40 text-[11px] uppercase tracking-wider text-nepsMuted font-bold">
                  <th className="py-3.5 px-4">Imagen</th>
                  <th className="py-3.5 px-4">Nombre</th>
                  <th className="py-3.5 px-4">Editorial</th>
                  <th className="py-3.5 px-4 text-center">Color</th>
                  <th className="py-3.5 px-4 text-center">Destacada</th>
                  <th className="py-3.5 px-4 text-center">Vigente</th>
                  <th className="py-3.5 px-4 text-center">Activa</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nepsBorder/60 text-xs">
                {franchises.map((franchise) => (
                  <tr
                    key={franchise.id}
                    className={`transition-colors ${!franchise.isActive ? 'bg-nepsInput/20 opacity-60' : 'hover:bg-nepsInput/30'}`}
                  >
                    <td className="py-3 px-4">
                      {franchise.imageId ? (
                        <ProtectedImage
                          src={`/images/${franchise.imageId}`}
                          alt={franchise.name}
                          className="w-10 h-10 rounded-lg object-cover bg-nepsInput border border-nepsBorder"
                          fallback={
                            <div className="w-10 h-10 rounded-lg bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px]">
                              Sin imagen
                            </div>
                          }
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px]">
                          Sin imagen
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {franchise.name}
                      {getStatusBadge(franchise)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={franchise.isActive ? 'text-white font-medium' : 'text-slate-300'}>{franchise.publisherName}</span>
                      <span className={`text-[10px] block ${franchise.isActive ? 'text-nepsMuted' : 'text-slate-500'}`}>{franchise.publisherCountryName}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 mx-auto shadow-sm"
                        style={{ backgroundColor: franchise.color || '#64748b' }}
                        title={franchise.color || 'Sin color'}
                      ></div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {franchise.isFeatured ? (
                        <svg className="w-4 h-4 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-4 h-4 text-nepsAccent mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {franchise.isOngoing ? (
                        <svg className="w-4 h-4 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-4 h-4 text-nepsAccent mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {franchise.isActive ? (
                        <svg className="w-4 h-4 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                      ) : (
                        <svg className="w-4 h-4 text-nepsAccent mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleManageWorks(franchise)}
                        className="p-1.5 text-nepsMuted hover:text-nepsPrimary rounded-lg hover:bg-nepsInput inline-block transition-colors"
                        title="Gestionar obras"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                      </button>
                      <button
                        onClick={() => handleEdit(franchise)}
                        className="p-1.5 text-nepsMuted hover:text-nepsPrimary rounded-lg hover:bg-nepsInput inline-block transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      {franchise.isActive ? (
                        <button
                          onClick={() => handleDeactivate(franchise)}
                          className="p-1.5 text-nepsMuted hover:text-nepsAccent rounded-lg hover:bg-nepsInput inline-block transition-colors"
                          title="Desactivar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(franchise)}
                          className="p-1.5 text-nepsMuted hover:text-emerald-400 rounded-lg hover:bg-nepsInput inline-block transition-colors"
                          title="Reactivar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-nepsBorder bg-nepsInput/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-nepsMuted">
            Mostrando <strong className="text-white">{franchises.length}</strong> de <strong className="text-white">{totalCount}</strong> franquicias
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Primera página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

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

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Última página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      {modalMode && selectedFranchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setModalMode(null)}>
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${modalMode === 'deactivate' ? 'bg-nepsAccent/10 border-nepsAccent/20 text-nepsAccent' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {modalMode === 'deactivate' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {modalMode === 'deactivate' ? '¿Desactivar Franquicia?' : '¿Reactivar Franquicia?'}
                  </h3>
                  <p className="text-xs text-nepsMuted mt-1">
                    Está a punto de {modalMode === 'deactivate' ? 'desactivar' : 'reactivar'} la franquicia <strong className="text-white">{selectedFranchise.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmAction}
                  disabled={isSaving}
                  className={`px-4 py-2 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2 ${modalMode === 'deactivate' ? 'bg-nepsAccent hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {isSaving ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'deactivate' ? 'Desactivar' : 'Reactivar'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FranchisesPage
