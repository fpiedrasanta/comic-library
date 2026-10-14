import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import type { CatalogEntityCard } from '../types/entity-cards'
import { EntityLogoFallback } from './entity-logo-fallback'
import { EntityPillLink } from './entity-pill-link'

/**
 * One entity of a listing, as a square image area with its parents as pills
 * overlaid on it and the name below.
 *
 * The same card renders Publisher, Franchise and Series: a publisher simply
 * arrives with no pills, and the layout is otherwise untouched. The image
 * fills its area with `object-cover` and no inner padding, matching the logos
 * of the contextual headers.
 */
export function EntityCard({ card }: { card: CatalogEntityCard }) {
  return (
    <article className="relative group bg-neps-card border border-neps-border hover:border-neps-primary/60 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(56,189,248,0.12)]">
      <div className="relative w-full aspect-square rounded-xl bg-neps-input/80 border border-neps-border/40 overflow-hidden group-hover:bg-neps-input transition-colors">
        <ProtectedImage
          src={card.urlImage}
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallback={<EntityLogoFallback name={card.name} color={card.color} className="text-4xl font-extrabold" />}
        />

        {card.pills.length > 0 && (
          /*
            `content-start` packs the wrapped rows against the top edge.
            Without it `align-content` stretches them over the full height of
            the area, so a second pill row lands in the middle of the image.

            `pointer-events-none` lets the overlay cover the whole area without
            swallowing the card click; the pills opt back in.
          */
          <div className="absolute inset-0 p-2 z-20 flex flex-wrap content-start items-start gap-1 pointer-events-none">
            {card.pills.map((pill) => (
              <EntityPillLink
                key={`${pill.level}-${pill.id}`}
                level={pill.level}
                name={pill.name}
                color={pill.color}
                to={pill.to}
              />
            ))}
          </div>
        )}
      </div>

      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-neps-primary transition-colors line-clamp-2 leading-snug">
        {card.name}
      </h3>

      {/*
        The card opens its own detail page, so the link is stretched over the
        whole card instead of wrapping it: the pills are links too and nested
        links are invalid HTML.

        It sits at z-10 on purpose. The image is `position: static`, and the
        hover `transform` makes it a stacking context that paints with the
        z-0 group, so at z-0 the link would tie with it and the image would win
        the click. The pills sit one level above at z-20.
      */}
      <Link to={card.to} title={card.name} aria-label={card.name} className="absolute inset-0 z-10 rounded-2xl">
        <span className="sr-only">{card.name}</span>
      </Link>
    </article>
  )
}
