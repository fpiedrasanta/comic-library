import { useEffect, useMemo, useRef, useState } from 'react'
import { CatalogSearch } from '../components/catalog-search'
import { EntityAutocomplete } from '../components/entity-autocomplete'
import { ListCard } from '../components/list-card'
import { ListCardSkeletonGrid } from '../components/list-card-skeleton'
import { EntityListingState } from '../components/entity-listing-state'
import { useCatalogLists, LIST_CARD_SKELETON_COUNT } from '../hooks/use-catalog-lists'
import { useEntityFilterOptions } from '../hooks/use-entity-filter-options'
import { useListingFilters } from '../hooks/use-listing-filters'
import { flattenEntityCards } from '../hooks/use-entity-cards'
import { useListTypes } from '../hooks/use-list-types'
import type { EntityOption } from '../types/works'

/** How close to the end of the list the next page is requested. */
const SCROLL_ROOT_MARGIN = '300px'

/**
 * `/lists` — the exploration of the official lists.
 *
 * Search, the Editorial → Franquicia → Serie cascade and the
 * list type filter all live in the URL, so a filtered listing
 * is shareable. The list itself is one infinite grid of cards.
 */
export function ListsPage() {
  const { filters, updateFilters, clearAll } = useListingFilters()
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
  } = useEntityFilterOptions(filters)

  const loaderRef = useRef<HTMLDivElement>(null)
  const query = useCatalogLists(filters)

  // List types come from the dedicated public endpoint.
  const [listTypeSearch, setListTypeSearch] = useState('')
  const { data: listTypesData } = useListTypes(listTypeSearch)
  const listTypeOptions = useMemo<EntityOption[]>(
    () => (listTypesData?.items ?? []).map((t) => ({ id: t.id, name: t.name })),
    [listTypesData?.items],
  )

  const lists = useMemo(
    () => flattenEntityCards(query.data?.pages.map((page) => page.items)),
    [query.data?.pages],
  )
  const totalCount = query.data?.pages[0]?.totalCount ?? 0
  const isInitialLoading = query.isPending
  const isFailing = query.isError
  const isEmpty = !isInitialLoading && !isFailing && lists.length === 0

  useEffect(() => {
    const node = loaderRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        // React Query ignores this while a page is already in flight,
        // so the observer can fire freely without stacking requests.
        if (entries[0].isIntersecting && query.hasNextPage) {
          query.fetchNextPage()
        }
      },
      { rootMargin: SCROLL_ROOT_MARGIN },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [query.hasNextPage, query.fetchNextPage])

  const currentPublisherOption = useMemo<EntityOption | null>(() => {
    if (filters.publisherId === null) return null
    return (
      publisherOptions.find((option) => option.id === filters.publisherId) ?? {
        id: filters.publisherId,
        name: '',
      }
    )
  }, [filters.publisherId, publisherOptions])

  const currentFranchiseOption = useMemo<EntityOption | null>(() => {
    if (filters.franchiseId === null) return null
    return (
      franchiseOptions.find((option) => option.id === filters.franchiseId) ?? {
        id: filters.franchiseId,
        name: '',
      }
    )
  }, [filters.franchiseId, franchiseOptions])

  const currentSeriesOption = useMemo<EntityOption | null>(() => {
    if (filters.seriesId === null) return null
    return (
      seriesOptions.find((option) => option.id === filters.seriesId) ?? {
        id: filters.seriesId,
        name: '',
      }
    )
  }, [filters.seriesId, seriesOptions])

  const currentListTypeOption = useMemo<EntityOption | null>(() => {
    if (filters.listTypeId === null) return null
    return (
      listTypeOptions.find((option) => option.id === filters.listTypeId) ?? {
        id: filters.listTypeId,
        name: '',
      }
    )
  }, [filters.listTypeId, listTypeOptions])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-8">
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neps-primary/10 text-neps-primary border border-neps-primary/20">
            Colecciones Temáticas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Listas de Lectura
          </h1>
          <p className="text-xs text-neps-muted max-w-2xl">
            Descubre guías de lectura, arcos argumentales y colecciones curadas
            organizadas por el sistema.
          </p>
        </div>

        <div className="bg-neps-card/60 border border-neps-border rounded-2xl p-4 sm:p-5 space-y-4 backdrop-blur-sm shadow-xl">
          <CatalogSearch
            value={filters.search}
            onChange={(value) => updateFilters({ search: value })}
            placeholder="Buscar listas por nombre o descripción..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-neps-border/60">
            <EntityAutocomplete
              label="Editorial"
              placeholder="Buscar editorial..."
              value={currentPublisherOption}
              options={publisherOptions}
              onSelect={(option) => {
                const nextPublisherId = option?.id ?? null
                updateFilters({
                  publisherId: nextPublisherId,
                  franchiseId: nextPublisherId === null ? filters.franchiseId : null,
                  seriesId: nextPublisherId === null ? filters.seriesId : null,
                })
                setFranchiseSearch('')
                setSeriesSearch('')
              }}
              onClear={() => {
                updateFilters({ publisherId: null, franchiseId: null, seriesId: null })
                setFranchiseSearch('')
                setSeriesSearch('')
              }}
              onSearch={setPublisherSearch}
              onFocus={() => setPublisherFocused(true)}
              onBlur={() => setPublisherFocused(false)}
              isLoading={publisherLoading}
            />

            <EntityAutocomplete
              label="Franquicia"
              placeholder="Buscar franquicia..."
              value={currentFranchiseOption}
              options={franchiseOptions}
              onSelect={(option) => {
                const nextFranchiseId = option?.id ?? null
                updateFilters({
                  franchiseId: nextFranchiseId,
                  seriesId: nextFranchiseId === null ? filters.seriesId : null,
                  publisherId: option?.publisherId ?? filters.publisherId,
                })
                setSeriesSearch('')
              }}
              onClear={() => {
                updateFilters({ franchiseId: null, seriesId: null })
                setSeriesSearch('')
              }}
              onSearch={setFranchiseSearch}
              onFocus={() => setFranchiseFocused(true)}
              onBlur={() => setFranchiseFocused(false)}
              isLoading={franchiseLoading}
            />

            <EntityAutocomplete
              label="Serie"
              placeholder="Buscar serie..."
              value={currentSeriesOption}
              options={seriesOptions}
              onSelect={(option) => {
                updateFilters({
                  seriesId: option?.id ?? null,
                  franchiseId: option?.franchiseId ?? filters.franchiseId,
                  publisherId: option?.publisherId ?? filters.publisherId,
                })
              }}
              onClear={() => {
                updateFilters({ seriesId: null })
              }}
              onSearch={setSeriesSearch}
              onFocus={() => setSeriesFocused(true)}
              onBlur={() => setSeriesFocused(false)}
              isLoading={seriesLoading}
            />

            <EntityAutocomplete
              label="Tipo de Lista"
              placeholder="Buscar tipo de lista..."
              value={currentListTypeOption}
              options={listTypeOptions}
              onSelect={(option) => updateFilters({ listTypeId: option?.id ?? null })}
              onClear={() => updateFilters({ listTypeId: null })}
              onSearch={setListTypeSearch}
            />
          </div>
        </div>
      </section>

      {isInitialLoading && (
        <section className="space-y-4">
          <p className="text-xs text-neps-muted border-b border-neps-border/60 pb-2">
            <span className="font-mono animate-pulse">Cargando listas de lectura...</span>
          </p>
          <ListCardSkeletonGrid count={LIST_CARD_SKELETON_COUNT} />
        </section>
      )}

      {isFailing && (
        <EntityListingState
          tone="error"
          title="Error al cargar las listas"
          message="No fue posible conectar con el servidor para obtener las listas. Por favor, reintenta."
          action={
            <button
              type="button"
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs text-red-300 font-semibold rounded-xl transition-all"
            >
              Reintentar
            </button>
          }
        />
      )}

      {isEmpty && (
        <EntityListingState
          tone="empty"
          title="No se encontraron listas"
          message="No existen colecciones que coincidan con los términos de búsqueda o los filtros seleccionados."
          action={
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 bg-neps-input hover:bg-neps-card border border-neps-border text-xs text-white font-semibold rounded-xl transition-all"
            >
              Limpiar filtros y búsqueda
            </button>
          }
        />
      )}

      {!isInitialLoading && !isFailing && lists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neps-muted border-b border-neps-border/60 pb-2">
            <p>
              Mostrando{' '}
              <span className="font-bold text-white">{totalCount}</span> listas
              encontradas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>

          {/*
            The sentinel has no size of its own: it only marks the
            end of the list so the observer knows when to ask for
            the next page.
           */}
          <div ref={loaderRef} aria-hidden className="h-px w-full" />

          {query.isFetchingNextPage && (
            <p className="text-center text-xs text-neps-muted font-mono animate-pulse">
              Cargando más listas...
            </p>
          )}

          {!query.hasNextPage && (
            <p className="text-center text-xs text-neps-muted">Fin del listado.</p>
          )}
        </section>
      )}
    </div>
  )
}
