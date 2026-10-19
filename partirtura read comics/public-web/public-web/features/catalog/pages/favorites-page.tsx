import { WorksPage } from '../components/works-page'
import { CatalogLayout } from '../components/catalog-layout'
import { ErrorBoundary } from '../components/error-boundary'

/**
 * Favoritos: the works the authenticated user marked as favorites.
 *
 * The same catalog page, with the `isFavorite` criterion as the only
 * difference: the search, the filters, the sorting and the infinite scroll
 * are the ones of the catalog, and the backend applies the criterion before
 * it counts, orders and paginates.
 */
export function FavoritesPage() {
  return (
    <ErrorBoundary>
      <CatalogLayout>
        <WorksPage
          contextType="favorites"
          header={
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Favoritos</h1>
              <p className="text-xs text-slate-400">Las obras que marcaste como favoritas.</p>
            </div>
          }
          emptyMessage="No hay obras favoritas que coincidan con los criterios actuales."
          resultLabel="obras favoritas"
        />
      </CatalogLayout>
    </ErrorBoundary>
  )
}
