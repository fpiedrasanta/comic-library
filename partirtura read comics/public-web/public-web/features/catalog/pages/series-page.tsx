import { getCatalogSeries } from '../api/entity-cards-repository'
import { EntityListingPage } from '../components/entity-listing-page'
import type { CatalogEntityCard, CatalogSeriesCardDto } from '../types/entity-cards'

function toCard(series: CatalogSeriesCardDto): CatalogEntityCard {
  return {
    id: series.id,
    name: series.name,
    color: series.color,
    urlImage: series.urlImage,
    // Outermost first, the same order the contextual headers read in.
    pills: [
      {
        level: 'publisher',
        id: series.publisher.id,
        name: series.publisher.name,
        color: series.publisher.color,
        to: `/publishers/${series.publisher.id}`,
      },
      {
        level: 'franchise',
        id: series.franchise.id,
        name: series.franchise.name,
        color: series.franchise.color,
        to: `/franchises/${series.franchise.id}`,
      },
    ],
    to: `/series/${series.id}`,
  }
}

/**
 * `/series`. The complete case: a series carries both parents as pills, which
 * is why the other two listings are the same component with fewer pills.
 */
export function SeriesPage() {
  return (
    <EntityListingPage<CatalogSeriesCardDto>
      kind="series"
      title="Series"
      description="Explora y filtra las colecciones periódicas de cómics y mangas organizadas por su franquicia y editorial."
      searchPlaceholder="Buscar Serie por nombre de Serie, nombre de Franquicia o nombre de Editorial..."
      entityLabel="Series"
      emptyMessage="Intenta buscar con otros términos. Puedes ingresar nombres de Series, Franquicias o Editoriales."
      fetcher={getCatalogSeries}
      toCard={toCard}
    />
  )
}
