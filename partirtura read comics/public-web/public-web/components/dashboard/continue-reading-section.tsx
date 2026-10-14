import { useNavigate } from 'react-router-dom'
import ContinueReadingCard from './continue-reading-card'
import type { WorkCatalogItemDto } from '@/features/catalog/types/works'

interface ContinueReadingSectionProps {
  works: WorkCatalogItemDto[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry: () => void
}

function SectionHeading() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neps-accent" />
        Continuar Lectura
      </h2>
      <button
        type="button"
        onClick={() => navigate('/my-collection')}
        className="text-xs text-neps-primary hover:underline font-medium"
      >
        Ver historial
      </button>
    </div>
  )
}

/**
 * Continue reading section of the index: the works the user is reading, most
 * recent activity first.
 *
 * Without works in progress the whole section disappears, so it never reserves
 * space on the index. A loading error keeps the heading with a retry, since it
 * is not the same as having nothing to show.
 */
export default function ContinueReadingSection({
  works,
  isLoading,
  isError,
  error,
  onRetry,
}: ContinueReadingSectionProps) {
  // The history guarantees progress per item, but the shared work type allows
  // it to be absent, so an item without progress is not a card.
  const cards = works.flatMap((work) =>
    work.myReadingProgress ? [{ work, progress: work.myReadingProgress }] : [],
  )

  if (isError) {
    return (
      <section className="space-y-4">
        <SectionHeading />
        <div className="py-8 text-center space-y-3 bg-neps-card/40 border border-neps-border rounded-2xl">
          <p className="text-xs font-bold text-white">No se pudo cargar tu avance de lectura</p>
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

  if (isLoading && cards.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeading />
        <div className="py-8 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-neps-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-neps-muted">Cargando obras...</span>
        </div>
      </section>
    )
  }

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <SectionHeading />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ work, progress }) => (
          <ContinueReadingCard key={work.id} work={work} progress={progress} />
        ))}
      </div>
    </section>
  )
}
