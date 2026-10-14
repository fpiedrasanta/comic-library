import { EntityHeader } from './entity-header'
import { useSeriesDetail } from '../hooks/use-series-detail'

/**
 * Header of `/series/:id`. Owns its data through `useSeriesDetail`, so the
 * header and the page's series filter share one request.
 *
 * Franchise and Publisher render as pills with their own color, the same
 * treatment the Franchise header gives its publisher. A level that comes back
 * without a color still renders, so the hierarchy never loses a link.
 */
export function SeriesHeader({ seriesId }: { seriesId: number }) {
  const { entity, isLoading, notFound, error } = useSeriesDetail(seriesId)

  const ancestors = [
    entity?.franchise
      ? {
          label: 'Franquicia',
          name: entity.franchise.name,
          to: `/franchises/${entity.franchise.id}`,
          color: entity.franchise.color ?? null,
        }
      : null,
    entity?.publisher
      ? {
          label: 'Editorial',
          name: entity.publisher.name,
          to: `/publishers/${entity.publisher.id}`,
          color: entity.publisher.color ?? null,
        }
      : null,
  ].filter((ancestor): ancestor is { label: string; name: string; to: string; color: string | null } => ancestor != null)

  return (
    <EntityHeader
      label="Serie"
      name={entity?.name ?? ''}
      color={entity?.color ?? null}
      urlImage={entity?.urlImage ?? null}
      description={entity?.description ?? null}
      ancestors={ancestors}
      isLoading={isLoading}
      notFound={notFound}
      error={error}
    />
  )
}