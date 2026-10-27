import { getCatalogPublishers } from '../api/entity-cards-repository'
import { EntityListingPage } from '../components/entity-listing-page'
import type { CatalogEntityCard, CatalogPublisherCardDto } from '../types/entity-cards'

function toCard(publisher: CatalogPublisherCardDto): CatalogEntityCard {
  return {
    id: publisher.id,
    name: publisher.name,
    color: publisher.color,
    urlImage: publisher.urlImage,
    // Nothing sits above a publisher, so the card carries no pills.
    pills: [],
    to: `/franchises?publisherId=${publisher.id}`,
  }
}

/**
 * `/publishers`. A publisher is the top of the hierarchy, so this is the
 * listing with the least information on the card: no pills at all.
 */
export function PublishersPage() {
  return (
    <EntityListingPage<CatalogPublisherCardDto>
      kind="publisher"
      title="Editoriales"
      description="Explora las editoriales del catálogo y sus colecciones publicadas."
      searchPlaceholder="Buscar Editorial por nombre..."
      entityLabel="Editoriales"
      emptyMessage="Intenta buscar con otros términos. Puedes ingresar nombres de Editoriales."
      fetcher={getCatalogPublishers}
      toCard={toCard}
    />
  )
}
