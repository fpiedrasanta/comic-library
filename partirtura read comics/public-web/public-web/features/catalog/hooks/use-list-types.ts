import { useQuery } from '@tanstack/react-query'
import { getListTypes } from '../api/lists-repository'

/** Loads active list types for the autocomplete, with search and pagination. */
export function useListTypes(search: string) {
  return useQuery({
    queryKey: ['catalog', 'list-types', search],
    queryFn: () => getListTypes(search),
    enabled: true,
    staleTime: 1000 * 60 * 5,
  })
}