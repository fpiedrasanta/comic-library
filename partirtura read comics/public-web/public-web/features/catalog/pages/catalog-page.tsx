import { WorksPage } from '../components/works-page'
import { CatalogLayout } from '../components/catalog-layout'
import { ErrorBoundary } from '../components/error-boundary'

export function CatalogPage() {
  return (
    <ErrorBoundary>
      <CatalogLayout>
        <WorksPage contextType="catalog" />
      </CatalogLayout>
    </ErrorBoundary>
  )
}
