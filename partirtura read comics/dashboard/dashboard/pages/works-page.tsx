import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import {
  getWorks,
  deactivateWork,
  activateWork,
  getWorkContentStatus,
  retryWorkContent,
} from '../features/works/services/works.service'
import PublisherSearchSelect from '../features/series/components/publisher-search-select'
import FranchiseSearchSelect from '../features/series/components/franchise-search-select'
import SeriesSearchSelect from '../features/series/components/series-search-select'
import WorkTypeSearchSelect from '../features/works/components/work-type-search-select'
import {
  ContentStatusLabel,
  IAStatusLabel,
  type ContentStatus,
  type WorkListItemDto,
} from '../types/works'

type SortField = 'title' | 'publicationDate' | 'createdAt' | 'language' | 'number'
type SortDir = 'asc' | 'desc'
type ModalMode = 'deactivate' | 'activate' | 'retry' | null

const CONTENT_STATUS_OPTIONS: Array<{ value: 'all' | ContentStatus; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 0, label: 'Faltante' },
  { value: 1, label: 'Procesando' },
  { value: 2, label: 'Finalizado OK' },
  { value: 3, label: 'Error' },
]

const IA_STATUS_OPTIONS: Array<{ value: 'all' | 0 | 1 | 2 | 3; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 0, label: 'Pendiente' },
  { value: 1, label: 'Procesando' },
  { value: 2, label: 'Completado' },
  { value: 3, label: 'Error' },
]

function WorksPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = 'Dashboard &gt; Gestionar obras'
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
  const [workTypeIdFilter, setWorkTypeIdFilter] = useState<number | undefined>(undefined)
  const [publisherIdFilter, setPublisherIdFilter] = useState<number | undefined>(undefined)
  const [franchiseIdFilter, setFranchiseIdFilter] = useState<number | undefined>(undefined)
  const [seriesIdFilter, setSeriesIdFilter] = useState<number | undefined>(undefined)
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [contentStatusFilter, setContentStatusFilter] = useState<'all' | ContentStatus>('all')
  const [iaRequestFilter, setIaRequestFilter] = useState<'all' | boolean>('all')
  const [iaStatusFilter, setIaStatusFilter] = useState<'all' | 0 | 1 | 2 | 3>('all')
  const [withDescriptionFilter, setWithDescriptionFilter] = useState<'all' | boolean>('all')
  const [publicationDateFrom, setPublicationDateFrom] = useState('')
  const [publicationDateTo, setPublicationDateTo] = useState('')
  const [createdAtFrom, setCreatedAtFrom] = useState('')
  const [createdAtTo, setCreatedAtTo] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedWork, setSelectedWork] = useState<WorkListItemDto | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const queryParams = useMemo(
    () => ({
      currentPage,
      pageSize,
      orderBy: sortField,
      orderDir: sortDir,
      search: search || undefined,
      workTypeId: workTypeIdFilter,
      publisherId: publisherIdFilter,
      franchiseId: franchiseIdFilter,
      seriesId: seriesIdFilter,
      isActive: isActiveFilter,
      contentStatus: contentStatusFilter === 'all' ? undefined : contentStatusFilter,
      publicationDateFrom: publicationDateFrom || undefined,
      publicationDateTo: publicationDateTo || undefined,
      createdAtFrom: createdAtFrom || undefined,
      createdAtTo: createdAtTo || undefined,
      iaRequest: iaRequestFilter === 'all' ? undefined : iaRequestFilter,
      iaStatus: iaStatusFilter === 'all' ? undefined : iaStatusFilter,
      withDescription: withDescriptionFilter === 'all' ? undefined : withDescriptionFilter,
    }),
    [
      currentPage,
      pageSize,
      sortField,
      sortDir,
      search,
      workTypeIdFilter,
      publisherIdFilter,
      franchiseIdFilter,
      seriesIdFilter,
      isActiveFilter,
      contentStatusFilter,
      publicationDateFrom,
      publicationDateTo,
      createdAtFrom,
      createdAtTo,
      iaRequestFilter,
      iaStatusFilter,
      withDescriptionFilter,
    ],
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['works', queryParams],
    queryFn: () => getWorks(queryParams),
  })

  const works = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Obras')
    setPageActions(
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsBorder px-3 py-2 rounded-xl transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span className="hidden sm:block">Volver al Dashboard</span>
      </button>,
    )
  }, [setPageTitle, setPageActions, navigate])

  useEffect(() => {
    const processing = works.filter((w) => w.contentStatus === 1)
    const processingIds = new Set(processing.map((w) => w.id))

    if (processingIds.size === 0) {
      return
    }

    const interval = setInterval(async () => {
      let changed = false
      const updated = new Set(processingIds)

      for (const id of updated) {
        try {
          const status = await getWorkContentStatus(id)
          if (status !== 1) {
            changed = true
            updated.delete(id)
          }
        } catch {
        }
      }

      if (changed) {
        queryClient.invalidateQueries({ queryKey: ['works'] })
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [works, queryClient])

  useEffect(() => {
    const iaInProgress = works.filter(
      (w) => w.iaRequest && (w.iaStatus === 0 || w.iaStatus === 1),
    )

    if (iaInProgress.length === 0) {
      return
    }

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
    }, 10000)

    return () => clearInterval(interval)
  }, [works, queryClient])

  const handleEdit = (work: WorkListItemDto) => {
    navigate(`/works/${work.id}/edit`)
  }

  const handleDeactivate = (work: WorkListItemDto) => {
    setSelectedWork(work)
    setModalMode('deactivate')
  }

  const handleActivate = (work: WorkListItemDto) => {
    setSelectedWork(work)
    setModalMode('activate')
  }

  const handleRetry = (work: WorkListItemDto) => {
    setSelectedWork(work)
    setModalMode('retry')
  }

  const confirmAction = async () => {
    if (!selectedWork || !modalMode) return

    setIsSaving(true)
    try {
      if (modalMode === 'deactivate') {
        await deactivateWork(selectedWork.id)
        setSuccessMessage(`"${selectedWork.title}" desactivado.`)
      } else if (modalMode === 'activate') {
        await activateWork(selectedWork.id)
        setSuccessMessage(`"${selectedWork.title}" reactivado.`)
      } else if (modalMode === 'retry') {
        await retryWorkContent(selectedWork.id)
        setSuccessMessage(`Reintento de procesamiento solicitado para "${selectedWork.title}".`)
      }

      queryClient.invalidateQueries({ queryKey: ['works'] })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al procesar la operación. Por favor, reintentá.')
    } finally {
      setIsSaving(false)
      setModalMode(null)
      setSelectedWork(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-2xl p-4 text-xs text-nepsAccent">
          Error al cargar las obras.
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-nepsCard border border-nepsBorder text-xs text-white rounded-xl"
        >
          Volver
        </button>
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
            placeholder="Buscar por título o número..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        {/* Line 1: Editorial | Franquicia | Serie | Tipo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-nepsBorder/60">
          <PublisherSearchSelect
            label="Editorial"
            value={publisherIdFilter}
            onChange={(val) => {
              setPublisherIdFilter(val)
              setCurrentPage(1)
            }}
          />
          <FranchiseSearchSelect
            label="Franquicia"
            value={franchiseIdFilter}
            onChange={(val) => {
              setFranchiseIdFilter(val)
              setCurrentPage(1)
            }}
          />
          <SeriesSearchSelect
            label="Serie"
            value={seriesIdFilter}
            onChange={(val) => {
              setSeriesIdFilter(val)
              setCurrentPage(1)
            }}
          />
          <WorkTypeSearchSelect
            label="Tipo"
            value={workTypeIdFilter}
            onChange={(val) => {
              setWorkTypeIdFilter(val)
              setCurrentPage(1)
            }}
          />
        </div>

        {/* Line 2: Activas | Contenido | IA request | IA response | Desc */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 border-t border-nepsBorder/60">
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
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Contenido</label>
            <select
              value={String(contentStatusFilter)}
              onChange={(e) => {
                const v = e.target.value
                setContentStatusFilter(v === 'all' ? 'all' : (Number(v) as ContentStatus))
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              {CONTENT_STATUS_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">IA request</label>
            <select
              value={iaRequestFilter === 'all' ? 'all' : iaRequestFilter ? 'si' : 'no'}
              onChange={(e) => {
                const val = e.target.value
                setIaRequestFilter(val === 'all' ? 'all' : val === 'si')
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="all">Todos</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">IA response</label>
            <select
              value={String(iaStatusFilter)}
              onChange={(e) => {
                const v = e.target.value
                setIaStatusFilter(v === 'all' ? 'all' : Number(v) as 0 | 1 | 2 | 3)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              {IA_STATUS_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Desc</label>
            <select
              value={withDescriptionFilter === 'all' ? 'all' : withDescriptionFilter ? 'si' : 'no'}
              onChange={(e) => {
                const val = e.target.value
                setWithDescriptionFilter(val === 'all' ? 'all' : val === 'si')
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="all">Todos</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Line 3: Public. desde | Public. hasta | Subido desde | Subido hasta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-nepsBorder/60">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Public. desde</label>
            <input
              type="date"
              value={publicationDateFrom}
              onChange={(e) => {
                setPublicationDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Public. hasta</label>
            <input
              type="date"
              value={publicationDateTo}
              onChange={(e) => {
                setPublicationDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Subido desde</label>
            <input
              type="date"
              value={createdAtFrom}
              onChange={(e) => {
                setCreatedAtFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Subido hasta</label>
            <input
              type="date"
              value={createdAtTo}
              onChange={(e) => {
                setCreatedAtTo(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            />
          </div>
        </div>

        {/* Line 4: Ordenar por, Orden (Asc/Desc) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-1 border-t border-nepsBorder/60">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Ordenar por</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="title">Título</option>
              <option value="publicationDate">Fecha Publicación</option>
              <option value="createdAt">Fecha Subida</option>
              <option value="language">Idioma</option>
              <option value="number">Número</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Orden</label>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as SortDir)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl">
        {isLoading && works.length === 0 ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-8 bg-nepsInput rounded-xl w-full"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-nepsInput rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : works.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-white">No se encontraron obras</h3>
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">No hay registros que coincidan con los criterios de búsqueda o filtros aplicados.</p>
          </div>
        ) : (
<div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nepsBorder bg-nepsInput/40 text-[11px] uppercase tracking-wider text-nepsMuted font-bold">
                  <th className="py-3.5 px-4"></th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Título</th>
                  <th className="py-3.5 px-4">Número</th>
                  <th className="py-3.5 px-4 text-center">Ant</th>
                  <th className="py-3.5 px-4 text-center">Sig</th>
                  <th className="py-3.5 px-4 text-center">Subida</th>
                  <th className="py-3.5 px-4 text-center">Pub</th>
                   <th className="py-3.5 px-4 text-center">C</th>
                   <th className="py-3.5 px-4 text-center">I</th>
                   <th className="py-3.5 px-4 text-center">A</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nepsBorder/60 text-xs">
                {works.map((work) => (
                  <tr
                    key={work.id}
                    className={`transition-colors ${!work.isActive ? 'bg-nepsInput/20 opacity-60' : 'hover:bg-nepsInput/30'}`}
                  >
                    <td className="py-2 px-3">
                      {work.coverId ? (
                        <ProtectedImage
                          src={work.urlCover}
                          alt={work.title}
                          className="w-9 h-12 rounded object-cover bg-nepsInput border border-nepsBorder"
                          fallback={
                            <div className="w-9 h-12 rounded bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[9px]">
                              —
                            </div>
                          }
                        />
                      ) : (
                        <div className="w-9 h-12 rounded bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[9px]">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-slate-300">{work.workType || '—'}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-white">{work.title}</div>
                    </td>
                    <td className="py-2 px-3">
                      {work.numberValue ? (
                        <span className="text-slate-300">#{work.numberValue}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {work.previousNumberValue ? (
                        <span className="text-slate-300">#{work.previousNumberValue}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {work.nextNumberValue ? (
                        <span className="text-slate-300">#{work.nextNumberValue}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-slate-300">{new Date(work.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-slate-300">{work.publicationDate ? new Date(work.publicationDate).toLocaleDateString() : '—'}</span>
                    </td>
                     <td className="py-2 px-3 text-center">
                       <span
                         className={`w-2.5 h-2.5 rounded-full inline-block ${
                           work.contentStatus === 0 ? 'bg-slate-500' :
                           work.contentStatus === 1 ? 'bg-amber-500' :
                           work.contentStatus === 2 ? 'bg-emerald-500' :
                           'bg-rose-500'
                         }`}
                         title={ContentStatusLabel[work.contentStatus]}
                       />
                     </td>
                      <td className="py-2 px-3 text-center">
                        {!work.iaRequest ? (
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block bg-slate-500"
                            title="Sin solicitud de IA"
                          />
                       ) : work.iaStatus === null ? (
                         <span
                           className="w-2.5 h-2.5 rounded-full inline-block bg-blue-500"
                           title={work.since ? `IA Pendiente - Since: ${work.since}` : 'IA Pendiente'}
                         />
                       ) : work.iaStatus === 0 ? (
                         <span
                           className="w-2.5 h-2.5 rounded-full inline-block bg-blue-500"
                           title={work.since ? `${IAStatusLabel[0]} - Since: ${work.since}` : IAStatusLabel[0]}
                         />
                       ) : work.iaStatus === 1 ? (
                         <span
                           className="w-2.5 h-2.5 rounded-full inline-block bg-amber-500"
                           title={work.since ? `${IAStatusLabel[1]} - Since: ${work.since}` : IAStatusLabel[1]}
                         />
                       ) : work.iaStatus === 2 ? (
                         <span
                           className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500"
                           title={work.since ? `${IAStatusLabel[2]} - Since: ${work.since}` : IAStatusLabel[2]}
                         />
                       ) : (
                         <span
                           className="w-2.5 h-2.5 rounded-full inline-block bg-rose-500"
                           title={work.since ? `${IAStatusLabel[3]} - Since: ${work.since}` : IAStatusLabel[3]}
                         />
                       )}
                     </td>
                     <td className="py-2 px-3 text-center">
                       <span
                         className={`w-2.5 h-2.5 rounded-full inline-block ${work.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                         title={work.isActive ? 'Activo' : 'Inactivo'}
                       />
                     </td>
                     <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(work)}
                          className="p-1.5 text-nepsMuted hover:text-white rounded-lg hover:bg-nepsInput inline-block transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        {work.isActive ? (
                          <button
                            onClick={() => handleDeactivate(work)}
                            className="p-1.5 text-nepsMuted hover:text-rose-400 rounded-lg hover:bg-nepsInput inline-block transition-colors"
                            title="Desactivar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(work)}
                            className="p-1.5 text-nepsMuted hover:text-emerald-400 rounded-lg hover:bg-nepsInput inline-block transition-colors"
                            title="Activar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          </button>
                        )}
                        {work.contentStatus === 3 && (
                          <button
                            onClick={() => handleRetry(work)}
                            className="p-1.5 text-nepsMuted hover:text-amber-400 rounded-lg hover:bg-nepsInput inline-block transition-colors"
                            title="Reintentar procesamiento"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && (
        <div className="flex items-center justify-between text-xs text-nepsMuted">
          <div>
            Mostrando {works.length} de {totalCount} obras
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!data.hasPriorPage}
              className="px-3 py-1.5 bg-nepsInput border border-nepsBorder rounded-lg disabled:opacity-50 hover:bg-nepsBorder transition-colors"
            >
              Anterior
            </button>
            <span>
              Página {data.currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!data.hasNextPage}
              className="px-3 py-1.5 bg-nepsInput border border-nepsBorder rounded-lg disabled:opacity-50 hover:bg-nepsBorder transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsPrimary/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 border border-nepsPrimary/20 flex items-center justify-center flex-shrink-0 text-nepsPrimary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Confirmar guardado?</h3>
                <p className="text-xs text-nepsMuted mt-1">Se registrarán los cambios de la obra.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">Asegurate de que los datos, las personas/roles y las etiquetas sean correctos antes de continuar.</p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder">
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
                className="px-4 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorksPage
