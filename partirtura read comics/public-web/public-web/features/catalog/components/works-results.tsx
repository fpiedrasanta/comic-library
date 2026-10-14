import type { RefObject } from 'react'
import type { EntityChainSelection, HierarchyLevel, WorkCatalogItemDto } from '../types/works'
import { ResultsGrid } from './results-grid'

interface WorksResultsProps {
  works: WorkCatalogItemDto[]
  totalCount: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  hasNextPage: boolean
  loaderRef: RefObject<HTMLDivElement | null>
  onRetry: () => void
  onSelectEntity: (selection: EntityChainSelection) => void
  hiddenPills?: HierarchyLevel[]
  emptyMessage?: string
  /** What the count says the results are, e.g. "resultados coincidentes". */
  resultLabel: string
}

/**
 * Result count, works grid and infinite-scroll sentinel of a works listing.
 * Shared by the catalog and by Mi colección so both report and paginate alike.
 */
export function WorksResults({
  works,
  totalCount,
  isLoading,
  isError,
  error,
  hasNextPage,
  loaderRef,
  onRetry,
  onSelectEntity,
  hiddenPills,
  emptyMessage,
  resultLabel,
}: WorksResultsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#2d2c33] pb-3">
        <p>
          Mostrando <span className="font-bold text-white">{totalCount}</span> {resultLabel}
        </p>
      </div>

      <ResultsGrid
        works={works}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={onRetry}
        onSelectEntity={onSelectEntity}
        hiddenPills={hiddenPills}
        emptyMessage={emptyMessage}
      />

      {hasNextPage && (
        <div ref={loaderRef} className="py-8 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-slate-400">Cargando más obras...</span>
        </div>
      )}
    </section>
  )
}
