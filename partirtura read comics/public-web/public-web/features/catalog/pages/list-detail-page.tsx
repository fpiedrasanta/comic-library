import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ListHeader } from '../components/list-header'
import { ResultsGrid } from '../components/results-grid'
import { useCatalogListDetail } from '../hooks/use-list-detail'
import type { CatalogListWorkItemDto } from '../types/lists'
import type {
  EntityChainSelection,
  WorkCatalogItemDto,
} from '../types/works'

/**
 * The list endpoint exposes what a work card needs: the number
 * within the series, the upload date and the color of each
 * parent, so the card renders the same as in the catalog.
 */
function toWork(item: CatalogListWorkItemDto): WorkCatalogItemDto {
  const { work } = item

  return {
    id: work.id,
    workTypeId: work.workTypeId ?? 0,
    workTypeName: work.workTypeName ?? '',
    title: work.title,
    description: work.description ?? '',
    numberValue: work.numberValue ?? null,
    publicationDate: work.publicationDate ?? '',
    createdAt: work.createdAt ?? '',
    coverId: 0,
    urlCover: work.urlCover ?? '',
    series:
      work.seriesId != null
        ? {
            id: work.seriesId,
            name: work.seriesName ?? '',
            color: work.seriesColor ?? '',
          }
        : null,
    franchise:
      work.franchiseId != null
        ? {
            id: work.franchiseId,
            name: work.franchiseName ?? '',
            color: work.franchiseColor ?? '',
          }
        : null,
    publisher:
      work.publisherId != null
        ? {
            id: work.publisherId,
            name: work.publisherName ?? '',
            color: work.publisherColor ?? '',
          }
        : null,
    // The list endpoint does not expose ratings.
    averageRating: null,
  }
}

/**
 * `/lists/:id` — the list and its works.
 *
 * The works render with the existing WorkCard, in the order the
 * list defines them: the list already fixed the set and the
 * order, so this page offers no work filter, search or sorting.
 * The pills of a work card navigate to the entity they name,
 * which is a way out of the list, not a filter on it.
 */
export function ListDetailPage({ entityId }: { entityId: number }) {
  const navigate = useNavigate()
  const { entity: list, isLoading, notFound, error } = useCatalogListDetail(entityId)

  const works = useMemo(
    () => (list?.works ?? []).map(toWork),
    [list],
  )

  const handleSelectEntity = (selection: EntityChainSelection) => {
    if (selection.seriesId) {
      navigate(`/series/${selection.seriesId}`)
    } else if (selection.franchiseId) {
      navigate(`/franchises/${selection.franchiseId}`)
    } else if (selection.publisherId) {
      navigate(`/publishers/${selection.publisherId}`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-10">
      <div>
        <Link
          to="/lists"
          className="inline-flex items-center gap-1 text-xs text-neps-muted hover:text-white font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a Exploración de Listas
        </Link>
      </div>

      <ListHeader list={list} isLoading={isLoading} notFound={notFound} error={error} />

      {!isLoading && !error && list != null && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-neps-border/80 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Obras de la Lista</span>
              <span className="text-xs font-mono font-normal text-neps-muted px-2 py-0.5 rounded bg-neps-input border border-neps-border">
                Orden Secuencial
              </span>
            </h2>
          </div>

          <ResultsGrid
            works={works}
            isLoading={false}
            isError={false}
            error={null}
            onSelectEntity={handleSelectEntity}
            emptyMessage="Esta lista todavía no tiene obras."
          />
        </section>
      )}
    </div>
  )
}
