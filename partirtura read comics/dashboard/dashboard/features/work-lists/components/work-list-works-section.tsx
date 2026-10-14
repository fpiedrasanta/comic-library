import { useState } from 'react'
import type { WorkListFormData } from '../pages/work-list-form-page'
import type { SearchWorkResult } from '../types/work-list'
import { ProtectedImage } from '@/components/protected-image'
import PublisherSearchSelect from '@/features/series/components/publisher-search-select'
import FranchiseSearchSelect from '@/features/series/components/franchise-search-select'
import SeriesSearchSelect from '@/features/series/components/series-search-select'

interface WorkListWorksSectionProps {
  watchedWorks: WorkListFormData['works']
  worksSearchResults: SearchWorkResult[]
  worksDetailsMap: Record<number, SearchWorkResult>
  showWorksSelector: boolean
  isSearchingWorks: boolean
  worksSearch: string
  worksSearchError: string | null
  worksFranchiseFilter: number | undefined
  worksPublisherFilter: number | undefined
  worksSeriesFilter: number | undefined
  onSearchChange: (value: string) => void
  onWorksFranchiseFilterChange: (value: number | undefined) => void
  onWorksPublisherFilterChange: (value: number | undefined) => void
  onWorksSeriesFilterChange: (value: number | undefined) => void
  onSearchWorks: () => void
  onAddWork: (work: SearchWorkResult) => void
  onRemoveWork: (index: number) => void
  onMoveWork: (from: number, to: number) => void
  onCloseSearch: () => void
  onToggleSelector: () => void
}

export default function WorkListWorksSection({
  watchedWorks,
  worksSearchResults,
  worksDetailsMap,
  showWorksSelector,
  isSearchingWorks,
  worksSearch,
  worksSearchError,
  worksFranchiseFilter,
  worksPublisherFilter,
  worksSeriesFilter,
  onSearchChange,
  onWorksFranchiseFilterChange,
  onWorksPublisherFilterChange,
  onWorksSeriesFilterChange,
  onSearchWorks,
  onAddWork,
  onRemoveWork,
  onMoveWork,
  onCloseSearch,
  onToggleSelector,
}: WorkListWorksSectionProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const getWorkDetails = (workId: number): SearchWorkResult | undefined => {
    return worksDetailsMap[workId] ?? worksSearchResults.find((w) => w.id === workId)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      onMoveWork(draggedIndex, index)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-3">
        <div>
          <h3 className="text-xs font-bold text-nepsMuted uppercase tracking-wider">
            2. Obras Incluidas ({watchedWorks.length})
          </h3>
          <p className="text-[11px] text-nepsMuted mt-0.5">Catálogo de obras asignadas a esta lista.</p>
        </div>
        <button
          type="button"
          onClick={onToggleSelector}
          className="px-4 py-2 bg-nepsPrimary hover:bg-sky-400 text-nepsBg font-bold rounded-xl text-xs shadow-lg shadow-nepsPrimary/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Agregar Obra</span>
        </button>
      </div>

      {showWorksSelector && (
        <div className="bg-nepsInput border border-nepsPrimary/40 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-nepsBorder pb-2">
            <span className="text-xs font-bold text-nepsPrimary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Obras en el Catálogo Global
            </span>
            <button
              type="button"
              onClick={onCloseSearch}
              className="text-nepsMuted hover:text-white text-xs"
            >
              ✕ Cerrar
            </button>
          </div>

          <div className="relative">
            <svg className="w-4 h-4 text-nepsMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título o número..."
              value={worksSearch}
              onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-nepsBg border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <FranchiseSearchSelect
              label="Franquicia"
              value={worksFranchiseFilter}
              onChange={onWorksFranchiseFilterChange}
            />
            <PublisherSearchSelect
              label="Editorial"
              value={worksPublisherFilter}
              onChange={onWorksPublisherFilterChange}
            />
            <SeriesSearchSelect
              label="Serie"
              value={worksSeriesFilter}
              onChange={onWorksSeriesFilterChange}
            />
          </div>

          {worksSearchError && (
            <p className="text-[11px] text-nepsAccent">{worksSearchError}</p>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              onSearchWorks()
            }}
            disabled={isSearchingWorks || !worksSearch.trim()}
            className="px-4 py-2 bg-nepsPrimary hover:bg-sky-400 text-nepsBg font-bold rounded-xl text-xs transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSearchingWorks ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 8 0 00-4 4H4z" />
                </svg>
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Buscar</span>
              </>
            )}
          </button>

          {worksSearchResults.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <p className="text-[10px] text-nepsMuted uppercase font-bold tracking-wider">
                Resultados ({worksSearchResults.length})
              </p>
              {worksSearchResults.map((work) => {
                const isAlreadyAdded = watchedWorks.some((w) => w.workId === work.id)
                return (
                  <div
                    key={work.id}
                    className="bg-nepsCard hover:bg-nepsBorder/60 border border-nepsBorder rounded-xl p-2.5 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {work.urlCover ? (
                        <ProtectedImage
                          src={work.urlCover}
                          alt={work.title}
                          className="w-10 h-14 object-cover rounded-md border border-nepsBorder"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-md border border-nepsBorder bg-nepsBg flex items-center justify-center text-nepsMuted">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-bold text-white truncate">{work.title}</p>
                          {work.numberValue && (
                            <span className="text-[10px] bg-nepsCard text-nepsMuted border border-nepsBorder px-2 py-0.5 rounded font-mono">
                              Nº {work.numberValue}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-nepsMuted truncate">
                          Serie: {work.seriesName || 'N/D'} | Franquicia: {work.franchiseName || 'N/D'}
                        </p>
                        {work.publisherName && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {work.publisherName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddWork(work)}
                      disabled={isAlreadyAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isAlreadyAdded
                          ? 'bg-nepsInput text-nepsMuted border border-nepsBorder cursor-not-allowed'
                          : 'bg-nepsPrimary/10 hover:bg-nepsPrimary text-nepsPrimary hover:text-nepsBg border border-nepsPrimary/30'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {isAlreadyAdded ? 'Incorporada' : '+ Incorporar'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {worksSearchResults.length === 0 && !isSearchingWorks && worksSearch && (
            <p className="text-[11px] text-nepsMuted">No se encontraron obras que coincidan con la búsqueda.</p>
          )}
        </div>
      )}

      {!showWorksSelector && watchedWorks.length === 0 && (
        <div className="border-2 border-dashed border-nepsBorder rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h4 className="text-xs font-bold text-white">No hay obras incluidas en esta lista</h4>
          <p className="text-[11px] text-nepsMuted max-w-sm mx-auto">
            Usá el botón "Agregar Obra" para buscar e integrar volúmenes o tomos desde el catálogo.
          </p>
        </div>
      )}

      {!showWorksSelector && watchedWorks.length > 0 && (
        <div className="space-y-2.5">
          {watchedWorks.map((work, index) => {
            const workDetails = getWorkDetails(work.workId)
            return (
              <div
                key={`${work.workId}-${work.position}`}
                draggable={true}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => {
                  e.preventDefault()
                  handleDragOver(index)
                }}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`bg-nepsInput border rounded-xl p-3 flex items-center justify-between gap-3 transition-all ${
                  draggedIndex === index
                    ? 'opacity-40 scale-95'
                    : dragOverIndex === index
                      ? 'border-nepsPrimary/50'
                      : 'border-nepsBorder'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" title="Arrastrar para reordenar">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  {workDetails?.urlCover ? (
                    <ProtectedImage
                      src={workDetails.urlCover}
                      alt={workDetails.title}
                      className="w-10 h-14 object-cover rounded-lg border border-nepsBorder flex-shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg border border-nepsBorder bg-nepsBg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-nepsMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="truncate space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white truncate">
                        {workDetails ? workDetails.title : `Obra #${work.workId}`}
                      </p>
                      {workDetails?.numberValue && (
                        <span className="text-[10px] bg-nepsCard text-nepsMuted border border-nepsBorder px-2 py-0.5 rounded font-mono">
                          Nº {workDetails.numberValue}
                        </span>
                      )}
                    </div>
                    {workDetails && (
                      <p className="text-[11px] text-nepsMuted truncate">
                        Serie: {workDetails.seriesName || 'N/D'} | Franquicia: {workDetails.franchiseName || 'N/D'}
                      </p>
                    )}
                    {workDetails?.publisherName && (
                      <p className="text-[10px] text-slate-400 truncate">
                        Editorial: <strong className="text-slate-200">{workDetails.publisherName}</strong>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveWork(index)}
                  title="Quitar obra de la lista"
                  className="px-2.5 py-1.5 bg-nepsAccent/10 hover:bg-nepsAccent text-nepsAccent hover:text-white border border-nepsAccent/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="hidden sm:inline">Quitar</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
