import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { getFranchisesForSelect } from '../features/series/services/series.service'
import type { FranchiseSelectItem } from '@/types/series'

function SeriesSelectFranchisePage() {
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseSelectItem | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['franchises-select-series', currentPage, pageSize, search],
    queryFn: () =>
      getFranchisesForSelect({
        currentPage,
        pageSize,
        search: search || undefined,
        isActive: true,
      }),
  })

  const franchises = data?.items ?? []
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Seleccionar Franquicia')
    setPageActions(
      <button
        onClick={() => navigate('/series')}
        className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span className="hidden sm:block">Cancelar</span>
      </button>
    )
  }, [setPageTitle, setPageActions, navigate])

  const handleSelect = (franchise: FranchiseSelectItem) => {
    setSelectedFranchise(franchise)
  }

  const handleContinue = () => {
    if (!selectedFranchise) return

    const editId = Object.keys(sessionStorage).find((key) => {
      if (!key.startsWith('series-form-values-')) return false
      const suffix = key.slice('series-form-values-'.length)
      return suffix !== '' && /^\d+$/.test(suffix)
    })?.slice('series-form-values-'.length)

    if (editId) {
      navigate(`/series/${editId}/edit`, { state: { selectedFranchise } })
    } else {
      navigate('/series/create', { state: { selectedFranchise } })
    }
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
      <div className="border-b border-nepsBorder/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Seleccionar Franquicia</h2>
          <p className="text-xs text-nepsMuted mt-0.5">Primero seleccioná la Franquicia a la que pertenecerá esta Serie antes de completar sus datos.</p>
        </div>
        <div className="text-xs text-nepsMuted bg-nepsCard border border-nepsBorder px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4 text-nepsPrimary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Esta acción no modifica la información de la franquicia.</span>
        </div>
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nepsMuted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar franquicia por nombre o editorial..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
          />
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
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">No hay registros que coincidan con los criterios de búsqueda aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nepsBorder bg-nepsInput/40 text-[11px] uppercase tracking-wider text-nepsMuted font-bold">
                  <th className="py-3.5 px-4 w-16">Imagen</th>
                  <th className="py-3.5 px-4">Nombre</th>
                  <th className="py-3.5 px-4">Editorial</th>
                  <th className="py-3.5 px-4 text-center w-20">Color</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nepsBorder/60 text-xs">
                {franchises.map((franchise) => {
                  const isSelected = selectedFranchise?.id === franchise.id
                  return (
                    <tr
                      key={franchise.id}
                      className={`transition-colors ${isSelected ? 'bg-nepsPrimary/10 border-l-4 border-l-nepsPrimary' : 'hover:bg-nepsInput/30'}`}
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
                        {isSelected && (
                          <span className="text-[10px] text-nepsPrimary bg-nepsPrimary/20 px-2 py-0.5 rounded font-bold uppercase ml-2 border border-nepsPrimary/30">
                            Seleccionada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{franchise.publisherName}</td>
                      <td className="py-3 px-4 text-center">
                        <div
                          className="w-5 h-5 rounded-full border border-white/20 mx-auto shadow-sm"
                          style={{ backgroundColor: franchise.color || '#64748b' }}
                          title={franchise.color || 'Sin color'}
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
                            onClick={() => handleSelect(franchise)}
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
            Mostrando <strong className="text-white">{franchises.length}</strong> de <strong className="text-white">{totalCount}</strong> franquicias
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

export default SeriesSelectFranchisePage
