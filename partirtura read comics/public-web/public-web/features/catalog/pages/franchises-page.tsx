import { useSearchParams } from 'react-router-dom'
import { getCatalogFranchises } from '../api/entity-cards-repository'
import { EntityListingPage } from '../components/entity-listing-page'
import type { CatalogEntityCard, CatalogFranchiseCardDto } from '../types/entity-cards'

function toCard(franchise: CatalogFranchiseCardDto): CatalogEntityCard {
  return {
    id: franchise.id,
    name: franchise.name,
    color: franchise.color,
    urlImage: franchise.urlImage,
    pills: [
      {
        level: 'publisher',
        id: franchise.publisher.id,
        name: franchise.publisher.name,
        color: franchise.publisher.color,
        to: `/franchises?publisherId=${franchise.publisher.id}`,
      },
    ],
    to: `/series?franchiseId=${franchise.id}`,
  }
}

/**
 * `/franchises`. Same listing as Series with one pill fewer: the franchise
 * sits under a publisher and has no franchise above it.
 */
export function FranchisesPage() {
  const [searchParams] = useSearchParams()
  const publisherId = Number(searchParams.get('publisherId')) || undefined
  return (
    <EntityListingPage<CatalogFranchiseCardDto>
      kind="franchise"
      title="Franquicias"
      description="Explora las franquicias del catálogo y las editoriales que las publican."
      searchPlaceholder="Buscar Franquicia por nombre o nombre de Editorial..."
      entityLabel="Franquicias"
      emptyMessage="Intenta buscar con otros términos. Puedes ingresar nombres de Franquicias o de Editoriales."
      fetcher={getCatalogFranchises}
      toCard={toCard}
      publisherId={publisherId}
    />
  )
}
