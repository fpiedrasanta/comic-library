import { RecommendedWorkCard } from '@/features/catalog/components/recommended-work-card'
import { RecommendedSortControls } from '@/features/catalog/components/recommended-sort-controls'
import type { RecommendedSortField, WorkCatalogItemDto } from '@/features/catalog/types/works'

interface CatalogSectionProps {
  works: WorkCatalogItemDto[]
  sortBy: RecommendedSortField
  onSortChange: (sortBy: RecommendedSortField) => void
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry: () => void
}

/**
 * Recommended works section of the index: works the user has not started, ordered
 * by the selected criterion.
 *
 * With no eligible works the whole section disappears, so it never reserves space
 * on the index. A loading error keeps the heading with a retry, because not being
 * able to load is not the same as having nothing to recommend.
 */
export default function CatalogSection({
  works,
  sortBy,
  onSortChange,
  isLoading,
  isError,
  error,
  onRetry,
}: CatalogSectionProps) {
  if (isError) {
    return (
      <section className="space-y-4" id="catalog">
        <SectionHeading sortBy={sortBy} onSortChange={onSortChange} />
        <div className="py-8 text-center space-y-3 bg-neps-card/40 border border-neps-border rounded-2xl">
          <p className="text-xs font-bold text-white">No se pudieron cargar las recomendaciones</p>
          <p className="text-[11px] text-neps-muted max-w-sm mx-auto">{error?.message ?? 'Ocurrió un error inesperado.'}</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-neps-primary/10 border border-neps-primary/30 hover:bg-neps-primary hover:text-neps-bg text-neps-primary text-xs font-bold rounded-lg transition-all"
          >
            Reintentar
          </button>
        </div>
      </section>
    )
  }

  if (isLoading && works.length === 0) {
    return (
      <section className="space-y-4" id="catalog">
        <SectionHeading sortBy={sortBy} onSortChange={onSortChange} />
        <div className="py-8 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-neps-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-neps-muted">Cargando obras...</span>
        </div>
      </section>
    )
  }

  if (works.length === 0) {
    return null
  }

  return (
    <section className="space-y-4" id="catalog">
      <SectionHeading sortBy={sortBy} onSortChange={onSortChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {works.map((work) => (
          <RecommendedWorkCard key={work.id} work={work} averageRating={work.averageRating} />
        ))}
      </div>
    </section>
  )
}

function SectionHeading({
  sortBy,
  onSortChange,
}: {
  sortBy: RecommendedSortField
  onSortChange: (sortBy: RecommendedSortField) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">Recomendados del Catálogo</h2>
        <p className="text-xs text-neps-muted">Obras que todavía no empezaste a leer.</p>
      </div>
      <RecommendedSortControls value={sortBy} onChange={onSortChange} />
    </div>
  )
}
