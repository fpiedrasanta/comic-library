import type { WorkCatalogItemDto, EntityChainSelection, HierarchyLevel } from '../types/works'
import { WorkCard } from './work-card'

interface ResultsGridProps {
  works: WorkCatalogItemDto[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry?: () => void
  onSelectEntity: (selection: EntityChainSelection) => void
  hiddenPills?: HierarchyLevel[]
  /** Override for the empty-state message, e.g. a list with no works. */
  emptyMessage?: string
}

export function ResultsGrid({ works, isLoading, isError, error, onRetry, onSelectEntity, hiddenPills, emptyMessage }: ResultsGridProps) {
  if (isLoading && works.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-mono text-slate-400">Cargando obras...</span>
      </div>
    )
  }

  if (isError && works.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-[#131a26]/40 border border-[#2d2c33] rounded-2xl">
        <div className="w-16 h-16 bg-[#0d121d] border border-[#2d2c33] rounded-full flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Error al cargar el catálogo</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {error?.message ?? 'Ocurrió un error inesperado.'}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-sky-400/10 border border-sky-400/30 hover:bg-sky-400 hover:text-[#0b0f19] text-sky-400 text-xs font-bold rounded-lg transition-all"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  if (!isLoading && works.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-[#131a26]/40 border border-[#2d2c33] rounded-2xl">
        <div className="w-16 h-16 bg-[#0d121d] border border-[#2d2c33] rounded-full flex items-center justify-center mx-auto text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">No se encontraron obras</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {emptyMessage ??
              'No hay publicaciones que coincidan con la combinación de filtros o términos buscados.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} _onSelectEntity={onSelectEntity} hiddenPills={hiddenPills} />
      ))}
    </div>
  )
}
