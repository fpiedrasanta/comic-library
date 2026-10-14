import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import {
  getPublishers,
  deactivatePublisher,
  activatePublisher,
} from '../features/publishers/services/publisher.service'
import type { Publisher } from '../types/publisher'

type SortField = 'name' | 'country'
type SortDir = 'asc' | 'desc'

type ModalMode = 'deactivate' | 'activate' | null

function PublishersPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = 'Dashboard &gt; Gestionar editoriales'
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
  const [isAliveFilter, setIsAliveFilter] = useState<boolean | undefined>(undefined)
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['publishers', currentPage, pageSize, sortField, sortDir, search, isFeaturedFilter, isAliveFilter, isActiveFilter],
    queryFn: () =>
      getPublishers({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
        isActive: isActiveFilter,
        isFeatured: isFeaturedFilter,
        isAlive: isAliveFilter,
      }),
  })

  const publishers = useMemo(() => {
    const items = data?.items ?? []
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.countryName,
      color: item.color || '',
      isFeatured: item.isFeatured,
      isAlive: item.isAlive,
      isActive: item.isActive,
      imageUrl: item.urlImage || null,
      description: '',
      website: null,
      foundedYear: null,
      history: '',
      createdAt: item.createdAt,
    })) as Publisher[]
  }, [data])

  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Gestión de Editoriales')
    setPageActions(
      <button
        onClick={() => navigate('/publishers/create')}
        className="bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-nepsPrimary/10 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nueva Editorial</span>
      </button>
    )
  }, [setPageTitle, setPageActions, navigate])

  const handleEdit = (publisher: Publisher) => {
    navigate(`/publishers/${publisher.id}/edit`)
  }

  const handleDeactivateClick = (publisher: Publisher) => {
    setSelectedPublisher(publisher)
    setModalMode('deactivate')
  }

  const handleActivateClick = (publisher: Publisher) => {
    setSelectedPublisher(publisher)
    setModalMode('activate')
  }

  const handleConfirmStateChange = async () => {
    if (!selectedPublisher) return

    setIsSaving(true)

    try {
      if (modalMode === 'deactivate') {
        await deactivatePublisher(selectedPublisher.id)
        setSuccessMessage(`Editorial ${selectedPublisher.name} desactivada`)
      } else if (modalMode === 'activate') {
        await activatePublisher(selectedPublisher.id)
        setSuccessMessage(`Editorial ${selectedPublisher.name} reactivada`)
      }

      setModalMode(null)
      setSelectedPublisher(null)
      setTimeout(() => setSuccessMessage(null), 3000)
      await queryClient.invalidateQueries({ queryKey: ['publishers'] })
    } catch (err) {
      setSuccessMessage(null)
      setModalMode(null)
      setSelectedPublisher(null)
    } finally {
      setIsSaving(false)
    }
  }

  const visibleCount = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalCount)
    return totalCount === 0 ? 0 : `${start}-${end}`
  }, [currentPage, pageSize, totalCount])

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {error instanceof Error ? error.message : 'Error al cargar las editoriales.'}
        </div>
      )}

      <div className="bg-nepsCard border border-nepsBorder p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar por nombre o país..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1 border-t border-nepsBorder/50">
          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Destacadas:</label>
            <select
              value={isFeaturedFilter === undefined ? '' : isFeaturedFilter ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value
                setIsFeaturedFilter(val === '' ? undefined : val === 'true')
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="">Todas</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Viva:</label>
            <select
              value={isAliveFilter === undefined ? '' : isAliveFilter ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value
                setIsAliveFilter(val === '' ? undefined : val === 'true')
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="">Todas</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Activa:</label>
            <select
              value={isActiveFilter === undefined ? '' : isActiveFilter ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value
                setIsActiveFilter(val === '' ? undefined : val === 'true')
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="">Todas</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
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
              <option value="name">Nombre</option>
              <option value="country">País</option>
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
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl relative">
        {isLoading ? (
          <div className="p-8 text-center text-nepsMuted text-xs">Cargando editoriales...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nepsBorder bg-nepsInput/50 text-[11px] uppercase tracking-wider text-nepsMuted font-semibold">
                  <th className="p-4 w-16">Imagen</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">País</th>
                  <th className="p-4 text-center w-20">Color</th>
                  <th className="p-4 text-center w-24">Destacada</th>
                  <th className="p-4 text-center w-20">Viva</th>
                  <th className="p-4 text-center w-20">Activa</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nepsBorder text-xs">
                {publishers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-nepsMuted">
                      No se encontraron editoriales.
                    </td>
                  </tr>
                ) : (
                  publishers.map((publisher) => (
                    <tr key={publisher.id} className={`hover:bg-nepsInput/30 transition-colors ${!publisher.isActive ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        {publisher.imageUrl ? (
                          <ProtectedImage
                            src={publisher.imageUrl}
                            alt={publisher.name}
                            className="w-10 h-10 rounded-xl object-contain bg-nepsInput border border-nepsBorder flex-shrink-0"
                            fallback={
                              <div className="w-10 h-10 rounded-xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px]">
                                Sin imagen
                              </div>
                            }
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px] font-bold uppercase flex-shrink-0">
                            <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white">{publisher.name}</span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {publisher.country}
                      </td>
                      <td className="p-4 text-center">
                        {publisher.color ? (
                          <div
                            className="w-5 h-5 rounded-full border border-white/20 mx-auto shadow-sm"
                            style={{ backgroundColor: publisher.color }}
                            title={publisher.color}
                          ></div>
                        ) : (
                          <span className="text-nepsMuted">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {publisher.isFeatured ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto" title="Destacada">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-nepsAccent/10 text-nepsAccent border border-nepsAccent/20 flex items-center justify-center mx-auto" title="No destacada">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {publisher.isAlive ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto" title="Viva">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-nepsAccent/10 text-nepsAccent border border-nepsAccent/20 flex items-center justify-center mx-auto" title="No viva">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {publisher.isActive ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto" title="Activa">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-nepsAccent/10 text-nepsAccent border border-nepsAccent/20 flex items-center justify-center mx-auto" title="Inactiva">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/publishers/${publisher.id}/works`)}
                          className="p-1.5 text-nepsMuted hover:text-nepsPrimary rounded-lg hover:bg-nepsInput inline-block transition-colors"
                          title="Gestionar obras"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                        </button>
                        <button
                          onClick={() => handleEdit(publisher)}
                          className="p-1.5 text-nepsMuted hover:text-white hover:bg-nepsInput rounded-lg transition-colors"
                          title="Editar editorial"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {publisher.isActive ? (
                          <button
                            onClick={() => handleDeactivateClick(publisher)}
                            className="p-1.5 text-nepsMuted hover:text-nepsAccent hover:bg-nepsAccent/10 rounded-lg transition-colors"
                            title="Desactivar editorial"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateClick(publisher)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Reactivar editorial"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && publishers.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-white">No se encontraron editoriales</h4>
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">
              No hay editoriales que coincidan con la búsqueda o los filtros aplicados. Intentá ajustar los criterios.
            </p>
          </div>
        )}
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsPrimary/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{visibleCount}</strong> de <strong className="text-white">{totalCount}</strong> editoriales registradas
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

      {modalMode === 'deactivate' && selectedPublisher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsAccent/10 text-nepsAccent flex items-center justify-center flex-shrink-0 border border-nepsAccent/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Desactivar Editorial</h3>
                <p className="text-xs text-nepsMuted mt-1">
                  ¿Confirmás la desactivación de la editorial <strong className="text-white">{selectedPublisher.name}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-nepsInput/60 border border-nepsBorder/80 p-3 rounded-xl text-[11px] text-nepsMuted space-y-1">
              <p className="font-semibold text-slate-300">Aviso sobre esta operación:</p>
              <p>• La editorial <strong>dejará de estar disponible en el catálogo</strong> del sistema.</p>
              <p>• Sus datos, relaciones e historial se conservarán intactos.</p>
              <p>• Podrás volver a activarla en cualquier momento desde esta misma pantalla.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setModalMode(null); setSelectedPublisher(null); }}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder/50 text-xs font-semibold text-slate-300 rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStateChange}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsAccent hover:bg-rose-600 text-xs font-bold text-white rounded-xl shadow-lg shadow-nepsAccent/20 transition-all flex items-center gap-1.5 disabled:opacity-70"
              >
                {isSaving ? (
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

      {modalMode === 'activate' && selectedPublisher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reactivar Editorial</h3>
                <p className="text-xs text-nepsMuted mt-1">
                  ¿Confirmás la reactivación de la editorial <strong className="text-white">{selectedPublisher.name}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-nepsInput/60 border border-nepsBorder/80 p-3 rounded-xl text-[11px] text-nepsMuted space-y-1">
              <p className="font-semibold text-slate-300">Aviso sobre esta operación:</p>
              <p>• La editorial <strong>volverá a estar disponible públicamente</strong> en el catálogo general.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setModalMode(null); setSelectedPublisher(null); }}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder/50 text-xs font-semibold text-slate-300 rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStateChange}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Confirmar Reactivación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublishersPage
