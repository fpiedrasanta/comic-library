import { EntityHeader } from './entity-header'
import { useFranchiseDetail } from '../hooks/use-franchise-detail'

/**
 * Header of `/franchises/:id`. Owns its data through `useFranchiseDetail`, so
 * the header and the page's franchise filter share one request. The publisher
 * comes from the same payload since TASK-API-0247, which is what lets the
 * page fix its publisher filter without asking for a work, and the header's
 * editorial pill link to that publisher's own page.
 */
export function FranchiseHeader({ franchiseId }: { franchiseId: number }) {
  const { entity, isLoading, notFound, error } = useFranchiseDetail(franchiseId)

  return (
    <EntityHeader
      label="Franquicia"
      name={entity?.name ?? ''}
      color={entity?.color ?? ''}
      urlImage={entity?.urlImage ?? null}
      description={entity?.description ?? null}
      parent={
        entity?.publisherId != null && entity.publisherName
          ? {
              label: 'Editorial',
              name: entity.publisherName,
              color: entity.publisherColor,
              to: `/publishers/${entity.publisherId}`,
            }
          : undefined
      }
      isLoading={isLoading}
      notFound={notFound}
      error={error}
    />
  )
}