import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const SEARCH_PARAM = 'search'

/**
 * The search term of a listing page, kept in the URL so a filtered listing can
 * be shared and the back button behaves.
 *
 * Writes use `replace`: the search is a continuous gesture, and pushing every
 * debounced term would fill the history with intermediate states.
 */
export function useListingSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = useMemo(() => searchParams.get(SEARCH_PARAM) ?? '', [searchParams])

  function setSearch(value: string) {
    setSearchParams(
      (prev) => {
        if (value) prev.set(SEARCH_PARAM, value)
        else prev.delete(SEARCH_PARAM)
        return prev
      },
      { replace: true },
    )
  }

  function clearSearch() {
    setSearchParams(
      (prev) => {
        prev.delete(SEARCH_PARAM)
        return prev
      },
      { replace: true },
    )
  }

  return { search, setSearch, clearSearch }
}
