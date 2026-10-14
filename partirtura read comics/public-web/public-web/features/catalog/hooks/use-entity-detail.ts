import { useQuery } from '@tanstack/react-query'

const ENTITY_DETAIL_STALE_TIME = 1000 * 60 * 5
const NOT_FOUND_STATUS = 404

export interface EntityDetailState<T> {
  entity: T | null
  isLoading: boolean
  notFound: boolean
  error: Error | null
}

interface EntityDetailQuery<T> {
  key: readonly unknown[]
  load: () => Promise<T>
  enabled: boolean
}

/**
 * Shared loader for the public entity detail endpoints used by the contextual
 * catalog headers.
 *
 * A 404 is a legitimate answer here (the id in the URL does not resolve), not
 * a transport failure, so it is not retried and is reported apart from a real
 * error. Callers share the cache entry with the page that needs the same
 * entity, so one id means one request.
 */
export function useEntityDetail<T>({ key, load, enabled }: EntityDetailQuery<T>): EntityDetailState<T> {
  const query = useQuery({
    queryKey: key,
    queryFn: load,
    enabled,
    staleTime: ENTITY_DETAIL_STALE_TIME,
    retry: false,
  })

  return {
    entity: query.data ?? null,
    isLoading: query.isPending,
    notFound: query.error != null && (query.error as { status?: number }).status === NOT_FOUND_STATUS,
    error: query.error as Error | null,
  }
}
