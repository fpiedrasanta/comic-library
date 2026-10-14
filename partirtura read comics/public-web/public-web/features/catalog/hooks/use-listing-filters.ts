import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const SEARCH_PARAM = 'search'
const PUBLISHER_PARAM = 'idPublisher'
const FRANCHISE_PARAM = 'idFranchise'
const SERIES_PARAM = 'idSerie'
const LIST_TYPE_PARAM = 'listTypeId'

export interface ListingFilters {
  search: string
  publisherId: number | null
  franchiseId: number | null
  seriesId: number | null
  listTypeId: number | null
}

function readNumberParam(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * The state of a filtered listing, kept in the URL.
 *
 * The entity filters reuse the parameter names of the catalog
 * (`idPublisher`, `idFranchise`, `idSerie`), so the URL vocabulary is
 * one across the catalog pages. Writes use `replace`: a filter change
 * is a refinement of the same listing, not a new history entry.
 */
export function useListingFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: ListingFilters = useMemo(
    () => ({
      search: searchParams.get(SEARCH_PARAM) ?? '',
      publisherId: readNumberParam(searchParams.get(PUBLISHER_PARAM)),
      franchiseId: readNumberParam(searchParams.get(FRANCHISE_PARAM)),
      seriesId: readNumberParam(searchParams.get(SERIES_PARAM)),
      listTypeId: readNumberParam(searchParams.get(LIST_TYPE_PARAM)),
    }),
    [searchParams],
  )

  function updateFilters(partial: Partial<ListingFilters>) {
    setSearchParams(
      (prev) => {
        if (partial.search !== undefined) {
          if (partial.search) prev.set(SEARCH_PARAM, partial.search)
          else prev.delete(SEARCH_PARAM)
        }
        if (partial.publisherId !== undefined) {
          if (partial.publisherId !== null) prev.set(PUBLISHER_PARAM, String(partial.publisherId))
          else prev.delete(PUBLISHER_PARAM)
        }
        if (partial.franchiseId !== undefined) {
          if (partial.franchiseId !== null) prev.set(FRANCHISE_PARAM, String(partial.franchiseId))
          else prev.delete(FRANCHISE_PARAM)
        }
        if (partial.seriesId !== undefined) {
          if (partial.seriesId !== null) prev.set(SERIES_PARAM, String(partial.seriesId))
          else prev.delete(SERIES_PARAM)
        }
        if (partial.listTypeId !== undefined) {
          if (partial.listTypeId !== null) prev.set(LIST_TYPE_PARAM, String(partial.listTypeId))
          else prev.delete(LIST_TYPE_PARAM)
        }
        return prev
      },
      { replace: true },
    )
  }

  function clearAll() {
    setSearchParams(
      (prev) => {
        prev.delete(SEARCH_PARAM)
        prev.delete(PUBLISHER_PARAM)
        prev.delete(FRANCHISE_PARAM)
        prev.delete(SERIES_PARAM)
        prev.delete(LIST_TYPE_PARAM)
        return prev
      },
      { replace: true },
    )
  }

  return { filters, updateFilters, clearAll }
}
