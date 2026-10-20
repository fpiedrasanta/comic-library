import { getCatalogListDetail } from '../api/lists-repository'
import { useRemoteData } from './use-remote-data'
import type { CatalogListDetailDto } from '../types/lists'

const NOT_FOUND_STATUS = 404

/**
 * The detail of a list, for the header and its works.
 *
 * The id comes from the route, and a 404 is a legitimate answer (the id does
 * not resolve to a list of the user), reported apart from a real error.
 *
 * The detail is not cached: opening the list always shows what the backend
 * answers at that moment, so a work that was added or removed from another
 * screen is never hidden behind a state that is still "fresh".
 */
export function useCatalogListDetail(id: number) {
  const { data, isLoading, error, reload, setData } = useRemoteData<CatalogListDetailDto>(
    () => getCatalogListDetail(id),
    [id]
  )

  return {
    entity: data,
    isLoading,
    notFound: error != null && (error as { status?: number }).status === NOT_FOUND_STATUS,
    error,
    reload,
    setData,
  }
}
