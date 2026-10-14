import { usePublisherDetail } from '../hooks/use-publisher-detail'
import { useFranchiseDetail } from '../hooks/use-franchise-detail'
import { useSeriesDetail } from '../hooks/use-series-detail'
import { WorksPage } from '../components/works-page'
import { CatalogLayout } from '../components/catalog-layout'
import { ErrorBoundary } from '../components/error-boundary'
import type { PublisherNode, FranchiseNode, SeriesNode } from '../types/works'

interface ContextPageProps {
  type: 'publisher' | 'franchise' | 'series'
  entityId: number
}

/**
 * A contextual catalog page.
 *
 * The route gives the level the page is about, and each detail endpoint gives
 * the levels above it. Nothing here depends on the page having works, which is
 * what used to leave a context page without a header and without its filter
 * when the entity had no works yet. The route ids are also what filter the
 * first request for works, so it is never unfiltered.
 */
export function ContextPage({ type, entityId }: ContextPageProps) {
  const id = Number.isFinite(entityId) ? entityId : Number.NaN

  const { entity: publisherDetail } = usePublisherDetail(type === 'publisher' ? id : Number.NaN)
  const { entity: franchiseDetail } = useFranchiseDetail(type === 'franchise' ? id : Number.NaN)
  const { entity: seriesDetail } = useSeriesDetail(type === 'series' ? id : Number.NaN)

  // The series detail carries the franchise and the publisher as id + name,
  // with the color present once the public payload exposes it and absent before
  // that, so the nodes above are built with whatever color comes back and the
  // ids the filters need. The publisher is required by a non-nullable FK, so
  // the nodes are only built once it actually comes back rather than with a
  // placeholder id.
  const publisher: PublisherNode | undefined =
    type === 'publisher' && publisherDetail != null
      ? { id: publisherDetail.id, name: publisherDetail.name, color: publisherDetail.color ?? '' }
      : type === 'franchise' && franchiseDetail?.publisherId != null
        ? {
            id: franchiseDetail.publisherId,
            name: franchiseDetail.publisherName ?? '',
            color: franchiseDetail.publisherColor ?? '',
          }
        : type === 'series' && seriesDetail?.publisher != null
          ? {
              id: seriesDetail.publisher.id,
              name: seriesDetail.publisher.name,
              color: seriesDetail.publisher.color ?? '',
            }
          : undefined

  const franchise: FranchiseNode | undefined =
    type === 'franchise' && franchiseDetail?.publisherId != null
      ? {
          id: franchiseDetail.id,
          name: franchiseDetail.name,
          color: franchiseDetail.color ?? '',
          publisherId: franchiseDetail.publisherId,
          publisherName: franchiseDetail.publisherName ?? '',
          publisherColor: franchiseDetail.publisherColor ?? '',
        }
      : type === 'series' && seriesDetail?.franchise != null && seriesDetail.publisher != null
        ? {
            id: seriesDetail.franchise.id,
            name: seriesDetail.franchise.name,
            color: seriesDetail.franchise.color ?? '',
            publisherId: seriesDetail.publisher.id,
            publisherName: seriesDetail.publisher.name,
            publisherColor: seriesDetail.publisher.color ?? '',
          }
        : undefined

  const series: SeriesNode | undefined =
    type === 'series' && seriesDetail?.franchise != null && seriesDetail.publisher != null
      ? {
          id: seriesDetail.id,
          name: seriesDetail.name,
          color: seriesDetail.color ?? '',
          franchiseId: seriesDetail.franchise.id,
          franchiseName: seriesDetail.franchise.name,
          publisherId: seriesDetail.publisher.id,
          publisherName: seriesDetail.publisher.name,
        }
      : undefined

  const hiddenFilters: Array<'publisher' | 'franchise' | 'series'> = []
  if (type === 'publisher') hiddenFilters.push('publisher')
  if (type === 'franchise') hiddenFilters.push('publisher', 'franchise')
  if (type === 'series') hiddenFilters.push('publisher', 'franchise', 'series')

  return (
    <ErrorBoundary>
      <CatalogLayout>
        <WorksPage
          contextType={type}
          contextEntity={{ publisher, franchise, series }}
          hiddenFilters={hiddenFilters}
          contextIds={{
            ...(type === 'publisher' ? { publisherId: id } : {}),
            ...(type === 'franchise' ? { franchiseId: id } : {}),
            ...(type === 'series' ? { seriesId: id } : {}),
          }}
        />
      </CatalogLayout>
    </ErrorBoundary>
  )
}
