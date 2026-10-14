import { EntityHeader } from './entity-header'
import { usePublisherDetail } from '../hooks/use-publisher-detail'

const FOUNDED_LABEL = 'Fundada en'

/**
 * Header of `/publishers/:id`. Owns its data through `usePublisherDetail`, so
 * the header and the page's publisher filter share one request.
 */
export function PublisherHeader({ publisherId }: { publisherId: number }) {
  const { entity, isLoading, notFound, error } = usePublisherDetail(publisherId)

  return (
    <EntityHeader
      label="Editorial"
      name={entity?.name ?? ''}
      color={entity?.color ?? null}
      urlImage={entity?.urlImage ?? null}
      description={entity?.description ?? null}
      facts={
        entity == null
          ? []
          : [
              entity.countryName,
              entity.foundedYear != null ? `${FOUNDED_LABEL} ${entity.foundedYear}` : null,
            ].filter((fact): fact is string => fact != null)
      }
      website={entity?.website ?? null}
      history={entity?.history ?? null}
      isLoading={isLoading}
      notFound={notFound}
      error={error}
    />
  )
}
