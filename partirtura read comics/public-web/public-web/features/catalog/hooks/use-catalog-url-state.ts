import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CatalogFilters, CatalogSort, WorkSortField, WorkSortDirection, WorkTypeFilter } from '../types/works'

const DEFAULT_SORT_FIELD: WorkSortField = 'CreatedAt'
const DEFAULT_SORT_DIRECTION: WorkSortDirection = 'desc'

const SEARCH_PARAM = 'search'
const PUBLISHER_PARAM = 'idPublisher'
const FRANCHISE_PARAM = 'idFranchise'
const SERIES_PARAM = 'idSerie'
const WORK_TYPE_PARAM = 'workTypeId'
const SORT_FIELD_PARAM = 'sort'
const SORT_DIRECTION_PARAM = 'direction'

function readNumberParam(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function readWorkTypeParam(value: string | null): WorkTypeFilter {
  if (!value || value === 'ALL') return 'ALL'
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 'ALL'
}

export function useCatalogUrlState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: CatalogFilters = useMemo(() => ({
    search: searchParams.get(SEARCH_PARAM) ?? '',
    publisherId: readNumberParam(searchParams.get(PUBLISHER_PARAM)),
    franchiseId: readNumberParam(searchParams.get(FRANCHISE_PARAM)),
    seriesId: readNumberParam(searchParams.get(SERIES_PARAM)),
    workTypeId: readWorkTypeParam(searchParams.get(WORK_TYPE_PARAM)),
  }), [searchParams])

  const sort: CatalogSort = useMemo(() => ({
    field: (searchParams.get(SORT_FIELD_PARAM) as WorkSortField) ?? DEFAULT_SORT_FIELD,
    direction: (searchParams.get(SORT_DIRECTION_PARAM) as WorkSortDirection) ?? DEFAULT_SORT_DIRECTION,
  }), [searchParams])

  function updateFilters(partial: Partial<CatalogFilters>) {
    setSearchParams((prev) => {
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
      if (partial.workTypeId !== undefined) {
        if (partial.workTypeId !== 'ALL') prev.set(WORK_TYPE_PARAM, String(partial.workTypeId))
        else prev.delete(WORK_TYPE_PARAM)
      }
      return prev
    }, { replace: true })
  }

  function updateSort(partial: Partial<CatalogSort>) {
    setSearchParams((prev) => {
      if (partial.field) prev.set(SORT_FIELD_PARAM, partial.field)
      if (partial.direction) prev.set(SORT_DIRECTION_PARAM, partial.direction)
      return prev
    }, { replace: true })
  }

  function resetAll() {
    setSearchParams((prev) => {
      prev.delete(SEARCH_PARAM)
      prev.delete(PUBLISHER_PARAM)
      prev.delete(FRANCHISE_PARAM)
      prev.delete(SERIES_PARAM)
      prev.delete(WORK_TYPE_PARAM)
      prev.delete(SORT_FIELD_PARAM)
      prev.delete(SORT_DIRECTION_PARAM)
      return prev
    }, { replace: true })
  }

  return {
    filters,
    sort,
    updateFilters,
    updateSort,
    resetAll,
    searchParams,
  }
}