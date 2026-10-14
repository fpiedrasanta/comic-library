import { useEffect, useMemo, useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCatalogUrlState, useInfiniteWorks, extractEntities, useEntityFilterOptions, useWorksPagination } from '../hooks'
import { getCatalogWorks } from '../api'
import { getWorkTypes } from '../api/catalog-repository'
import { CatalogSearch } from './catalog-search'
import { EntityAutocomplete } from './entity-autocomplete'
import { franchiseOption, seriesOption, workTypeOption } from './option-mappers'
import { SortControls } from './sort-controls'
import { WorksResults } from './works-results'
import { PublisherHeader } from './publisher-header'
import { FranchiseHeader } from './franchise-header'
import { SeriesHeader } from './series-header'
import type { PublisherNode, FranchiseNode, SeriesNode, EntityOption, EntityChainSelection, HierarchyLevel } from '../types/works'

const SORT_FIELD_MAP: Record<string, string> = {
  CreatedAt: 'CreatedAt',
  PublicationDate: 'PublicationDate',
  Title: 'Title',
  Number: 'Number',
}

const FILTER_PAGE_SIZE = 12
const FILTER_SORT_FIELD = 'Name'
const FILTER_SORT_DIRECTION = 'asc'
const ALL_WORK_TYPES = 'ALL'

interface WorksPageProps {
  contextType?: 'catalog' | 'publisher' | 'franchise' | 'series'
  contextEntity?: {
    publisher?: PublisherNode
    franchise?: FranchiseNode
    series?: SeriesNode
  }
  hiddenFilters?: Array<'publisher' | 'franchise' | 'series'>
  /**
   * Ids taken from the route. The route is enough to filter the level it
   * names, so the first request for works is never unfiltered; the detail
   * endpoint only adds the levels above it once it resolves.
   */
  contextIds?: {
    publisherId?: number
    franchiseId?: number
    seriesId?: number
  }
}

/**
 * Levels the current route already fixes, so repeating them on every card is
 * noise.
 */
const HIDDEN_PILLS_BY_CONTEXT: Partial<Record<NonNullable<WorksPageProps['contextType']>, HierarchyLevel[]>> = {
  publisher: ['publisher'],
  franchise: ['publisher', 'franchise'],
  series: ['publisher', 'franchise', 'series'],
}

export function WorksPage({
  contextType = 'catalog',
  contextEntity,
  hiddenFilters = [],
  contextIds = {},
}: WorksPageProps) {
  const { filters, sort, updateFilters, updateSort } = useCatalogUrlState()

  const [workTypeSearch, setWorkTypeSearch] = useState('')
  const [workTypeFocused, setWorkTypeFocused] = useState(false)

  /**
   * The level the route names is applied from the route, so the very first
   * works request already carries a filter. The levels above it come from the
   * detail endpoint and are layered on as soon as it resolves.
   */
  const activeFilters = useMemo(() => {
    const base = { ...filters }
    if (contextType === 'publisher') {
      base.publisherId = contextIds.publisherId ?? base.publisherId
    }
    if (contextType === 'franchise') {
      base.franchiseId = contextIds.franchiseId ?? base.franchiseId
      if (contextEntity?.publisher) base.publisherId = contextEntity.publisher.id
    }
    if (contextType === 'series') {
      base.seriesId = contextIds.seriesId ?? base.seriesId
      if (contextEntity?.franchise) base.franchiseId = contextEntity.franchise.id
      if (contextEntity?.publisher) base.publisherId = contextEntity.publisher.id
    }
    return base
  }, [filters, contextType, contextEntity, contextIds])

  // The Editorial → Franquicia → Serie autocomplete options, shared
  // with the lists exploration.
  const {
    setPublisherSearch,
    setFranchiseSearch,
    setSeriesSearch,
    setPublisherFocused,
    setFranchiseFocused,
    setSeriesFocused,
    publisherOptions,
    franchiseOptions,
    seriesOptions,
    publisherLoading,
    franchiseLoading,
    seriesLoading,
  } = useEntityFilterOptions(activeFilters)

  const worksParams = useMemo(
    () => ({
      search: activeFilters.search || undefined,
      publisherId: activeFilters.publisherId ?? undefined,
      franchiseId: activeFilters.franchiseId ?? undefined,
      seriesId: activeFilters.seriesId ?? undefined,
      workTypeId:
        activeFilters.workTypeId === ALL_WORK_TYPES ? undefined : activeFilters.workTypeId,
      orderBy: SORT_FIELD_MAP[sort.field] || 'CreatedAt',
      orderDir: sort.direction,
    }),
    [activeFilters, sort]
  )

  const { baseQueryKey, pageSize } = useInfiniteWorks(worksParams)
  const fetchWorksPage = useCallback(
    (page: number) => getCatalogWorks({ currentPage: page, pageSize, ...worksParams }),
    [pageSize, worksParams],
  )
  const {
    works: accumulatedWorks,
    firstPageItems,
    totalCount,
    isLoading: isWorksLoading,
    isError: isWorksError,
    error: worksError,
    hasNextPage,
    loaderRef,
    refetch: refetchWorks,
  } = useWorksPagination({ queryKey: baseQueryKey, fetchPage: fetchWorksPage, pageSize })

  const workTypesQuery = useQuery({
    queryKey: ['catalog', 'work-types', workTypeSearch],
    queryFn: () =>
      getWorkTypes({
        search: workTypeSearch || undefined,
        pageSize: FILTER_PAGE_SIZE,
        orderBy: FILTER_SORT_FIELD,
        orderDir: FILTER_SORT_DIRECTION,
      }),
    enabled: workTypeSearch.length > 0 || workTypeFocused,
    staleTime: 1000 * 60 * 2,
  })

  useEffect(() => {
    if (contextType === 'publisher' && contextEntity?.publisher) {
      if (activeFilters.publisherId !== contextEntity.publisher.id) {
        updateFilters({ publisherId: contextEntity.publisher.id })
      }
    }
    if (contextType === 'franchise') {
      if (contextEntity?.publisher && activeFilters.publisherId !== contextEntity.publisher.id) {
        updateFilters({ publisherId: contextEntity.publisher.id })
      }
      if (contextEntity?.franchise && activeFilters.franchiseId !== contextEntity.franchise.id) {
        updateFilters({ franchiseId: contextEntity.franchise.id })
      }
    }
    if (contextType === 'series') {
      if (contextEntity?.publisher && activeFilters.publisherId !== contextEntity.publisher.id) {
        updateFilters({ publisherId: contextEntity.publisher.id })
      }
      if (contextEntity?.franchise && activeFilters.franchiseId !== contextEntity.franchise.id) {
        updateFilters({ franchiseId: contextEntity.franchise.id })
      }
      if (contextEntity?.series && activeFilters.seriesId !== contextEntity.series.id) {
        updateFilters({ seriesId: contextEntity.series.id })
      }
    }
  }, [contextType, contextEntity, activeFilters.publisherId, activeFilters.franchiseId, activeFilters.seriesId, updateFilters])

  const showPublisherFilter = !hiddenFilters.includes('publisher')
  const showFranchiseFilter = !hiddenFilters.includes('franchise')
  const showSeriesFilter = !hiddenFilters.includes('series')

  const entitiesOfCurrentWorks = useMemo(
    () => extractEntities(firstPageItems),
    [firstPageItems]
  )

  // The route fixes its own hierarchy level, so a pill click can only refine
  // the levels below it. On /catalog nothing is fixed and the selection wins.
  const fixedHierarchy = useMemo(() => {
    if (contextType === 'publisher') {
      return { publisherId: contextIds.publisherId, franchiseId: undefined, seriesId: undefined }
    }
    if (contextType === 'franchise') {
      return {
        publisherId: contextEntity?.publisher?.id ?? contextIds.publisherId,
        franchiseId: contextIds.franchiseId,
        seriesId: undefined,
      }
    }
    if (contextType === 'series') {
      return {
        publisherId: contextEntity?.publisher?.id ?? contextIds.publisherId,
        franchiseId: contextEntity?.franchise?.id ?? contextIds.franchiseId,
        seriesId: contextIds.seriesId,
      }
    }
    return { publisherId: undefined, franchiseId: undefined, seriesId: undefined }
  }, [contextType, contextEntity, contextIds])

  const handleSelectEntity = (selection: EntityChainSelection) => {
    updateFilters({
      publisherId: fixedHierarchy.publisherId ?? selection.publisherId ?? null,
      franchiseId: fixedHierarchy.franchiseId ?? selection.franchiseId ?? null,
      seriesId: fixedHierarchy.seriesId ?? selection.seriesId ?? null,
    })
  }

  const workTypeOptions = useMemo(
    () => (workTypesQuery.data?.items ?? []).map(workTypeOption),
    [workTypesQuery.data?.items]
  )

  const currentPublisherOption = useMemo<EntityOption | null>(() => {
    if (activeFilters.publisherId === null) return null
    return (
      entitiesOfCurrentWorks.publishers.get(activeFilters.publisherId) ??
      publisherOptions.find((option) => option.id === activeFilters.publisherId) ?? {
        id: activeFilters.publisherId,
        name: '',
      }
    )
  }, [activeFilters.publisherId, entitiesOfCurrentWorks.publishers, publisherOptions])

  const currentFranchiseOption = useMemo<EntityOption | null>(() => {
    if (activeFilters.franchiseId === null) return null
    const fromWorks = entitiesOfCurrentWorks.franchises.get(activeFilters.franchiseId)
    return (
      (fromWorks
        ? franchiseOption({
            id: fromWorks.id,
            name: fromWorks.name,
            color: fromWorks.color,
            publisherId: fromWorks.publisherId,
            publisherName: fromWorks.publisherName,
          })
        : null) ??
      franchiseOptions.find((option) => option.id === activeFilters.franchiseId) ?? {
        id: activeFilters.franchiseId,
        name: '',
      }
    )
  }, [activeFilters.franchiseId, entitiesOfCurrentWorks.franchises, franchiseOptions])

  const currentSeriesOption = useMemo<EntityOption | null>(() => {
    if (activeFilters.seriesId === null) return null
    const fromWorks = entitiesOfCurrentWorks.series.get(activeFilters.seriesId)
    return (
      (fromWorks
        ? seriesOption({
            id: fromWorks.id,
            name: fromWorks.name,
            color: fromWorks.color,
            franchiseId: fromWorks.franchiseId,
            franchiseName: fromWorks.franchiseName,
            publisherId: fromWorks.publisherId,
            publisherName: fromWorks.publisherName,
          })
        : null) ??
      seriesOptions.find((option) => option.id === activeFilters.seriesId) ?? {
        id: activeFilters.seriesId,
        name: '',
      }
    )
  }, [activeFilters.seriesId, entitiesOfCurrentWorks.series, seriesOptions])

  const currentWorkTypeOption = useMemo<EntityOption | null>(() => {
    if (activeFilters.workTypeId === ALL_WORK_TYPES) return null
    return (
      workTypeOptions.find((option) => option.id === activeFilters.workTypeId) ?? {
        id: activeFilters.workTypeId,
        name: '',
      }
    )
  }, [activeFilters.workTypeId, workTypeOptions])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-8">
      {contextType === 'publisher' && contextIds.publisherId != null && (
        <PublisherHeader publisherId={contextIds.publisherId} />
      )}

      {contextType === 'franchise' && contextIds.franchiseId != null && (
        <FranchiseHeader franchiseId={contextIds.franchiseId} />
      )}

      {contextType === 'series' && contextIds.seriesId != null && (
        <SeriesHeader seriesId={contextIds.seriesId} />
      )}

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <CatalogSearch value={activeFilters.search} onChange={(value) => updateFilters({ search: value })} />
          <div className="flex items-center gap-2 justify-between md:justify-end flex-shrink-0">
            <SortControls
              sortField={sort.field}
              sortDirection={sort.direction}
              onFieldChange={(field) => updateSort({ field })}
              onDirectionToggle={() => updateSort({ direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
            />
          </div>
        </div>

        <div className="bg-[#131a26] border border-[#2d2c33] rounded-2xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {showPublisherFilter && (
              <EntityAutocomplete
                label="Editorial"
                placeholder="Buscar editorial..."
                value={currentPublisherOption}
                options={publisherOptions}
                onSelect={(option) => {
                  const nextPublisherId = option?.id ?? null
                  updateFilters({
                    publisherId: nextPublisherId,
                    franchiseId: nextPublisherId === null ? activeFilters.franchiseId : null,
                    seriesId: nextPublisherId === null ? activeFilters.seriesId : null,
                  })
                  setFranchiseSearch('')
                  setSeriesSearch('')
                }}
                onClear={() => {
                  updateFilters({ publisherId: null, franchiseId: null, seriesId: null })
                  setFranchiseSearch('')
                  setSeriesSearch('')
                }}
                disabled={contextType === 'publisher'}
                onSearch={setPublisherSearch}
                onFocus={() => setPublisherFocused(true)}
                onBlur={() => setPublisherFocused(false)}
                isLoading={publisherLoading}
              />
            )}
            {showFranchiseFilter && (
              <EntityAutocomplete
                label="Franquicia"
                placeholder="Buscar franquicia..."
                value={currentFranchiseOption}
                options={franchiseOptions}
                onSelect={(option) => {
                  const nextFranchiseId = option?.id ?? null
                  updateFilters({
                    franchiseId: nextFranchiseId,
                    seriesId: nextFranchiseId === null ? activeFilters.seriesId : null,
                    publisherId: option?.publisherId ?? activeFilters.publisherId,
                  })
                  setSeriesSearch('')
                }}
                onClear={() => {
                  updateFilters({ franchiseId: null, seriesId: null })
                  setSeriesSearch('')
                }}
                disabled={contextType === 'franchise'}
                onSearch={setFranchiseSearch}
                onFocus={() => setFranchiseFocused(true)}
                onBlur={() => setFranchiseFocused(false)}
                isLoading={franchiseLoading}
              />
            )}
            {showSeriesFilter && (
              <EntityAutocomplete
                label="Serie"
                placeholder="Buscar serie..."
                value={currentSeriesOption}
                options={seriesOptions}
                onSelect={(option) => {
                  updateFilters({
                    seriesId: option?.id ?? null,
                    franchiseId: option?.franchiseId ?? activeFilters.franchiseId,
                    publisherId: option?.publisherId ?? activeFilters.publisherId,
                  })
                }}
                onClear={() => {
                  updateFilters({ seriesId: null })
                }}
                disabled={contextType === 'series'}
                onSearch={setSeriesSearch}
                onFocus={() => setSeriesFocused(true)}
                onBlur={() => setSeriesFocused(false)}
                isLoading={seriesLoading}
              />
            )}
            <EntityAutocomplete
              label="Tipo de obra"
              placeholder="Buscar tipo de obra..."
              value={currentWorkTypeOption}
              options={workTypeOptions}
              onSelect={(option) => updateFilters({ workTypeId: option?.id ?? ALL_WORK_TYPES })}
              onClear={() => updateFilters({ workTypeId: ALL_WORK_TYPES })}
              onSearch={setWorkTypeSearch}
              onFocus={() => setWorkTypeFocused(true)}
              onBlur={() => setWorkTypeFocused(false)}
              isLoading={workTypesQuery.isFetching}
            />
          </div>
        </div>
      </section>

      <WorksResults
        works={accumulatedWorks}
        totalCount={totalCount}
        isLoading={isWorksLoading}
        isError={isWorksError}
        error={worksError}
        hasNextPage={hasNextPage}
        loaderRef={loaderRef}
        onRetry={refetchWorks}
        onSelectEntity={handleSelectEntity}
        hiddenPills={HIDDEN_PILLS_BY_CONTEXT[contextType] ?? []}
        resultLabel="resultados coincidentes"
      />
    </div>
  )
}
