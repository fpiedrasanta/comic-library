import { useEffect, useRef } from 'react'
import {
  ENTITY_CARD_SKELETON_COUNT,
  flattenEntityCards,
  useEntityCards,
  type EntityCardsFetcher,
} from '../hooks/use-entity-cards'
import { useListingSearch } from '../hooks/use-listing-search'
import type { CatalogEntityCard, CatalogEntityKind } from '../types/entity-cards'
import { CatalogSearch } from './catalog-search'
import { EntityCard } from './entity-card'
import { EntityCardSkeletonGrid } from './entity-card-skeleton'
import { EntityListingState } from './entity-listing-state'

/** How close to the end of the list the next page is requested. */
const SCROLL_ROOT_MARGIN = '300px'

export interface EntityListingPageProps<T extends { id: number }> {
  kind: CatalogEntityKind
  title: string
  description: string
  searchPlaceholder: string
  /** Noun used by the empty state, e.g. "Series". */
  entityLabel: string
  emptyMessage: string
  fetcher: EntityCardsFetcher<T>
  publisherId?: number
  franchiseId?: number
  /** Builds the shared card shape, including where the card navigates. */
  toCard: (item: T) => CatalogEntityCard
}

/**
 * The explore listing behind `/publishers`, `/franchises` and `/series`.
 *
 * The three pages differ only in the config they pass: which endpoint to page,
 * how to name each card and which parents it carries as pills. Everything the
 * user does here — searching, scrolling, the states — is this one component.
 */
export function EntityListingPage<T extends { id: number }>({
  kind,
  title,
  description,
  searchPlaceholder,
  entityLabel,
  emptyMessage,
  fetcher,
  publisherId,
  franchiseId,
  toCard,
}: EntityListingPageProps<T>) {
  const { search, setSearch, clearSearch } = useListingSearch()
  const loaderRef = useRef<HTMLDivElement>(null)

  const query = useEntityCards<T>({ kind, search, fetcher, publisherId, franchiseId })

  const cards = flattenEntityCards(query.data?.pages.map((page) => page.items)).map(toCard)
  const totalCount = query.data?.pages[0]?.totalCount ?? 0
  const isInitialLoading = query.isPending
  const isFailing = query.isError
  const isEmpty = !isInitialLoading && !isFailing && cards.length === 0

  useEffect(() => {
    const node = loaderRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        // React Query ignores this while a page is already in flight, so the
        // observer can fire freely without stacking requests.
        if (entries[0].isIntersecting && query.hasNextPage) {
          query.fetchNextPage()
        }
      },
      { rootMargin: SCROLL_ROOT_MARGIN },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [query.hasNextPage, query.fetchNextPage])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-8">
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neps-primary/10 text-neps-primary border border-neps-primary/20">
            Exploración de Entidades
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-neps-muted max-w-2xl">{description}</p>
        </div>

        <div className="w-full max-w-3xl">
          <CatalogSearch value={search} onChange={setSearch} placeholder={searchPlaceholder} />
        </div>
      </section>

      {isInitialLoading && (
        <section className="space-y-4">
          <p className="text-xs text-neps-muted border-b border-neps-border/60 pb-2">
            <span className="font-mono animate-pulse">Cargando resultados del catálogo...</span>
          </p>
          <EntityCardSkeletonGrid count={ENTITY_CARD_SKELETON_COUNT} />
        </section>
      )}

      {isFailing && (
        <EntityListingState
          tone="error"
          title="Error de conexión"
          message={`No se pudieron cargar las ${entityLabel} del catálogo. Por favor, verifica tu conexión e inténtalo de nuevo.`}
          action={
            <button
              type="button"
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs text-red-300 font-semibold rounded-xl transition-all"
            >
              Reintentar carga
            </button>
          }
        />
      )}

      {isEmpty && (
        <EntityListingState
          tone="empty"
          title="No se encontraron coincidencias"
          message={emptyMessage}
          action={
            search && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 bg-neps-input hover:bg-neps-card border border-neps-border text-xs text-white font-semibold rounded-xl transition-all"
              >
                Restablecer búsqueda
              </button>
            )
          }
        />
      )}

      {!isInitialLoading && !isFailing && cards.length > 0 && (
        <section className="space-y-4">
          <p className="text-xs text-neps-muted border-b border-neps-border/60 pb-2">
            Mostrando <span className="font-bold text-white">{totalCount}</span> elementos registrados
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {cards.map((card) => (
              <EntityCard key={card.id} card={card} />
            ))}
          </div>

          {/*
            The sentinel has no size of its own: it only marks the end of the
            list so the observer knows when to ask for the next page.
          */}
          <div ref={loaderRef} aria-hidden className="h-px w-full" />

          {query.isFetchingNextPage && (
            <p className="text-center text-xs text-neps-muted font-mono animate-pulse">Cargando más {entityLabel.toLowerCase()}...</p>
          )}

          {!query.hasNextPage && (
            <p className="text-center text-xs text-neps-muted">Fin del listado.</p>
          )}
        </section>
      )}
    </div>
  )
}
