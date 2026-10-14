import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorksResults } from '../components/works-results'
import { ReadingStateFilter } from '../components/reading-state-filter'
import { CatalogLayout } from '../components/catalog-layout'
import { ErrorBoundary } from '../components/error-boundary'
import { useReadingHistory } from '../hooks'
import type { EntityChainSelection, ReadingHistoryState } from '../types/works'

const DEFAULT_STATE: ReadingHistoryState = 'reading'

const EMPTY_MESSAGES: Record<ReadingHistoryState, string> = {
  reading: 'No estás leyendo ninguna obra. Empieza una desde el catálogo y aparecerá aquí.',
  completed: 'Todavía no completaste ninguna obra.',
  all: 'Todavía no hay obras en tu historial de lectura.',
}

const RESULT_LABELS: Record<ReadingHistoryState, string> = {
  reading: 'obras en lectura',
  completed: 'obras leídas',
  all: 'obras en tu historial',
}

/**
 * Mi colección: the reading history of the authenticated user.
 *
 * Same layout, grid and WorkCard as the catalog — only the source and the state
 * filter differ. The backend orders by last activity, so there is no search,
 * no sort and no hierarchy filters here.
 */
export function MyCollectionPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<ReadingHistoryState>(DEFAULT_STATE)
  const {
    works,
    totalCount,
    isLoading,
    isError,
    error,
    hasNextPage,
    loaderRef,
    refetch,
  } = useReadingHistory(state)

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
    <ErrorBoundary>
      <CatalogLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-8">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">Mi colección</h1>
                <p className="text-xs text-slate-400">Las obras que estás leyendo y las que ya completaste.</p>
              </div>
              <ReadingStateFilter value={state} onChange={setState} />
            </div>
          </section>

          <WorksResults
            works={works}
            totalCount={totalCount}
            isLoading={isLoading}
            isError={isError}
            error={error}
            hasNextPage={hasNextPage}
            loaderRef={loaderRef}
            onRetry={refetch}
            onSelectEntity={handleSelectEntity}
            emptyMessage={EMPTY_MESSAGES[state]}
            resultLabel={RESULT_LABELS[state]}
          />
        </div>
      </CatalogLayout>
    </ErrorBoundary>
  )
}
