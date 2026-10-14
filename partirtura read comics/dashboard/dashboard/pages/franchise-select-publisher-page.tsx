import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { getPublishers } from '../features/publishers/services/publisher.service'
import type { AdminPublisherListItemDto } from '@/types/publisher'

type SortField = 'name' | 'countryName'
type SortDir = 'asc' | 'desc'

type PublisherSelectItem = Pick<AdminPublisherListItemDto, 'id' | 'name' | 'countryName' | 'color' | 'urlImage'>

function FranchiseSelectPublisherPage() {
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [countryFilter, setCountryFilter] = useState<string>('todos')
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherSelectItem | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['publishers-select', currentPage, pageSize, sortField, sortDir, search, countryFilter],
    queryFn: () =>
      getPublishers({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
        isActive: true,
      }),
  })

  const publishers = (data?.items ?? []) as AdminPublisherListItemDto[]
  const totalCount = data?.totalCount ?? 0
  const countries = useMemo(() => {
    const set = new Set(publishers.map((p) => p.countryName))
    return Array.from(set).sort()
  }, [publishers])

  useEffect(() => {
    setPageTitle('Seleccionar Editorial')
    setPageActions(
      <button
        onClick={() => navigate('/franchises')}
        className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span className="hidden sm:block">Cancelar</span>
      </button>
    )
  }, [setPageTitle, setPageActions, navigate])

  const handleSelect = (publisher: AdminPublisherListItemDto) => {
    setSelectedPublisher({
      id: publisher.id,
      name: publisher.name,
      countryName: publisher.countryName,
      color: publisher.color,
      urlImage: publisher.urlImage,
    })
  }

  const handleContinue = () => {
    if (!selectedPublisher) return

    const editId = Object.keys(sessionStorage).find((key) => {
      if (!key.startsWith('franchise-form-values-')) return false
      const suffix = key.slice('franchise-form-values-'.length)
      return suffix !== '' && /^\d+$/.test(suffix)
    })?.slice('franchise-form-values-'.length)

    if (editId) {
      navigate(`/franchises/${editId}/edit`, { state: { selectedPublisher } })
    } else {
      navigate('/franchises/create', { state: { selectedPublisher } })
    }
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-2xl p-4 text-xs text-nepsAccent">
          Error al cargar las editoriales.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-nepsBorder/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Seleccionar Editorial Madre</h2>
          <p className="text-xs text-nepsMuted mt-0.5">Primero seleccioná la Editorial a la que pertenecerá esta Franquicia antes de completar sus datos.</p>
        </div>
        <div className="text-xs text-nepsMuted bg-nepsCard border border-nepsBorder px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4 text-nepsPrimary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Esta acción no modifica la información de la editorial.</span>
        </div>
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nepsMuted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar editorial por nombre o país..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-nepsBorder/60">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">País</label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="todos">Todos los países</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Destacadas</label>
            <select
              value="todas"
              disabled
              className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary opacity-60"
            >
              <option value="todas">Todas</option>
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
              <option value="countryName">País</option>
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
        {isLoading && publishers.length === 0 ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-8 bg-nepsInput rounded-xl w-full"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-nepsInput rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : publishers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-white">No se encontraron editoriales</h3>
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">No hay registros que coincidan con los criterios de búsqueda o filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nepsBorder bg-nepsInput/40 text-[11px] uppercase tracking-wider text-nepsMuted font-bold">
                  <th className="py-3.5 px-4 w-16">Imagen</th>
                  <th className="py-3.5 px-4">Nombre</th>
                  <th className="py-3.5 px-4">País</th>
                  <th className="py-3.5 px-4 text-center w-20">Color</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nepsBorder/60 text-xs">
                {publishers.map((publisher) => {
                  const isSelected = selectedPublisher?.id === publisher.id
                  return (
                    <tr
                      key={publisher.id}
                      className={`transition-colors ${isSelected ? 'bg-nepsPrimary/10 border-l-4 border-l-nepsPrimary' : 'hover:bg-nepsInput/30'}`}
                    >
                      <td className="py-3 px-4">
                        <ProtectedImage
                          src={publisher.urlImage}
                          alt={publisher.name}
                          className="w-10 h-10 rounded-lg object-cover bg-nepsInput border border-nepsBorder"
                          fallback={
                            <div className="w-10 h-10 rounded-lg bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px]">
                              Sin imagen
                            </div>
                          }
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {publisher.name}
                        {isSelected && (
                          <span className="text-[10px] text-nepsPrimary bg-nepsPrimary/20 px-2 py-0.5 rounded font-bold uppercase ml-2 border border-nepsPrimary/30">
                            Seleccionada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{publisher.countryName}</td>
                      <td className="py-3 px-4 text-center">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 mx-auto shadow-sm"
                          style={{ backgroundColor: publisher.color || '#64748b' }}
                          title={publisher.color || 'Sin color'}
                        ></div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isSelected ? (
                          <button
                            onClick={handleContinue}
                            className="px-4 py-2 bg-nepsPrimary hover:bg-sky-400 text-nepsBg font-bold rounded-xl text-xs shadow-md shadow-nepsPrimary/20 inline-flex items-center gap-1.5 transition-all"
                          >
                            <span>Continuar</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelect(publisher)}
                            className="px-4 py-2 bg-nepsInput hover:bg-nepsBorder text-white font-semibold border border-nepsBorder rounded-xl text-xs transition-colors"
                          >
                            Seleccionar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-nepsBorder bg-nepsInput/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-nepsMuted">
            Mostrando <strong className="text-white">{publishers.length}</strong> de <strong className="text-white">{totalCount}</strong> editoriales
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-nepsInput border border-nepsBorder text-nepsMuted hover:text-white transition-colors disabled:opacity-40"
            >
              Anterior
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-nepsPrimary/10 border border-nepsPrimary/30 text-nepsPrimary font-bold">1</button>
            <button className="px-3 py-1.5 rounded-lg bg-nepsInput border border-nepsBorder text-nepsMuted hover:text-white transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg bg-nepsInput border border-nepsBorder text-nepsMuted hover:text-white transition-colors">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FranchiseSelectPublisherPage
