import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPublishers, getFranchises, getSeries } from '../api/catalog-repository'
import { franchiseOption, publisherOption, seriesOption } from '../components/option-mappers'

const FILTER_PAGE_SIZE = 12
const FILTER_SORT_FIELD = 'Name'
const FILTER_SORT_DIRECTION = 'asc'
const STALE_TIME_MS = 1000 * 60 * 2

/** The levels the current listing already has fixed, if any. */
export interface EntityFilterSelection {
  publisherId: number | null
  franchiseId: number | null
  seriesId: number | null
}

/**
 * The Editorial → Franquicia → Serie autocomplete options shared by the
 * catalog works page and the lists page.
 *
 * The options are backend-driven and respect the selected context: the
 * franchise options of a publisher, the series options of a franchise.
 * The queries only fire while the user is typing, a level is selected
 * or the input is focused, so an idle page makes no request for them.
 */
export function useEntityFilterOptions(filters: EntityFilterSelection) {
  const [publisherSearch, setPublisherSearch] = useState('')
  const [franchiseSearch, setFranchiseSearch] = useState('')
  const [seriesSearch, setSeriesSearch] = useState('')
  const [publisherFocused, setPublisherFocused] = useState(false)
  const [franchiseFocused, setFranchiseFocused] = useState(false)
  const [seriesFocused, setSeriesFocused] = useState(false)

  const publishersQuery = useQuery({
    queryKey: ['catalog', 'publishers', publisherSearch],
    queryFn: () =>
      getPublishers({
        search: publisherSearch || undefined,
        pageSize: FILTER_PAGE_SIZE,
        orderBy: FILTER_SORT_FIELD,
        orderDir: FILTER_SORT_DIRECTION,
      }),
    enabled: publisherSearch.length > 0 || filters.publisherId !== null || publisherFocused,
    staleTime: STALE_TIME_MS,
  })

  const franchisesQuery = useQuery({
    queryKey: ['catalog', 'franchises', franchiseSearch, filters.publisherId],
    queryFn: () =>
      getFranchises({
        search: franchiseSearch || undefined,
        publisherId: filters.publisherId ?? undefined,
        pageSize: FILTER_PAGE_SIZE,
        orderBy: FILTER_SORT_FIELD,
        orderDir: FILTER_SORT_DIRECTION,
      }),
    enabled: franchiseSearch.length > 0 || filters.publisherId !== null || franchiseFocused,
    staleTime: STALE_TIME_MS,
  })

  const seriesQuery = useQuery({
    queryKey: ['catalog', 'series', seriesSearch, filters.franchiseId, filters.publisherId],
    queryFn: () =>
      getSeries({
        search: seriesSearch || undefined,
        franchiseId: filters.franchiseId ?? undefined,
        // A franchise already narrows to its publisher, so the publisher
        // only filters the series when no franchise is selected.
        publisherId: filters.franchiseId === null ? (filters.publisherId ?? undefined) : undefined,
        pageSize: FILTER_PAGE_SIZE,
        orderBy: FILTER_SORT_FIELD,
        orderDir: FILTER_SORT_DIRECTION,
      }),
    enabled:
      seriesSearch.length > 0 ||
      filters.franchiseId !== null ||
      filters.publisherId !== null ||
      seriesFocused,
    staleTime: STALE_TIME_MS,
  })

  return {
    publisherSearch,
    setPublisherSearch,
    franchiseSearch,
    setFranchiseSearch,
    seriesSearch,
    setSeriesSearch,
    publisherFocused,
    setPublisherFocused,
    franchiseFocused,
    setFranchiseFocused,
    seriesFocused,
    setSeriesFocused,
    publisherOptions: (publishersQuery.data?.items ?? []).map(publisherOption),
    franchiseOptions: (franchisesQuery.data?.items ?? []).map(franchiseOption),
    seriesOptions: (seriesQuery.data?.items ?? []).map(seriesOption),
    publisherLoading: publishersQuery.isFetching,
    franchiseLoading: franchisesQuery.isFetching,
    seriesLoading: seriesQuery.isFetching,
  }
}
