import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import { readableAccentColor } from '../utils/entity-color'
import { FavoriteButton } from './favorite-button'
import type { WorkCatalogItemDto } from '../types/works'

/** Card surface the accent colors are read against. */
const CARD_SURFACE = '#131a26'

interface RecommendedWorkCardProps {
  work: WorkCatalogItemDto
  /** Average rating of the work, `null` when it has no ratings. */
  averageRating: number | null
}

/**
 * One recommended work of the index: a cover grid card in 2:3 with the publisher,
 * the title and the available editorial data below it.
 *
 * A different composition from `WorkCard` on purpose: this card is pure discovery
 * (a cover, a rating and a title), so it carries no hierarchy pills, no work type
 * and no reading scale. Selecting it goes to the work detail.
 */
export function RecommendedWorkCard({ work, averageRating }: RecommendedWorkCardProps) {
  const publisherName = work.publisher?.name ?? 'Sin editorial'
  const publisherColor = work.publisher ? readableAccentColor(work.publisher.color, CARD_SURFACE) : CARD_SURFACE

  const editorialDetails = [
    work.numberValue ? `Nº ${work.numberValue}` : null,
    work.publicationDate ? String(new Date(work.publicationDate).getFullYear()) : null,
  ]
    .filter((detail): detail is string => detail !== null)
    .join(' • ')

  return (
    <article className="relative group flex flex-col bg-neps-card border border-neps-border hover:border-neps-primary/60 rounded-xl overflow-hidden transition-all duration-300">
      {/*
        The card opens the work detail, and the star is a control of its own.
        A link that covers the card, with the content above it, keeps both
        actions apart: the star is never inside the link, so clicking it never
        navigates and the keyboard reaches it as a button.
      */}
      <Link
        to={`/works/${work.id}`}
        aria-label={`Ver detalle de ${work.title}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neps-primary/70"
      />

      <div className="relative z-10 pointer-events-none">
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-neps-input">
          <ProtectedImage
            src={work.urlCover}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {averageRating !== null && (
            <span className="absolute top-2 right-2 bg-neps-bg/80 backdrop-blur-md border border-neps-border text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              ★ {averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="relative z-10 p-3 space-y-1 pointer-events-none">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: publisherColor }}>
          {publisherName}
        </p>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white truncate group-hover:text-neps-primary transition-colors flex-1">
            {work.title}
          </h3>
          <div className="pointer-events-auto">
            <FavoriteButton work={work} />
          </div>
        </div>
        {editorialDetails && <p className="text-[11px] text-neps-muted">{editorialDetails}</p>}
      </div>
    </article>
  )
}
