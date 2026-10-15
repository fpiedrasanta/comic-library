import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import {
  colorWithAlpha,
  readableBackgroundColor,
  readablePillTextColor,
} from '../utils/entity-color'
import { hasVisibleProgress, hasVisibleRating } from '../utils/list-metrics'
import type { CatalogListCardDto } from '../types/lists'

const CARD_SURFACE = '#131a26'
const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.3
const GLOW_ALPHA = 0.25
const ACCENT_ALPHA = 0.7

/**
 * One list of the `/lists` exploration.
 *
 * The cover is a vertical comic cover: it fills its area with
 * `object-cover` and no inner padding, and the list color is the
 * accent. The whole card is a link to the list detail; there are
 * no nested links, so the link wraps the card instead of being
 * stretched over it.
 *
 * Below the title it carries the list metrics the API already
 * returns: the rating (only when the average is a valid score) and
 * the reading progress of the authenticated user (never shown as
 * `0%` when there is no progress at all).
 */
export function ListCard({ list }: { list: CatalogListCardDto }) {
  const vars = list.color
    ? ({
        '--list-glow': colorWithAlpha(list.color, GLOW_ALPHA),
        '--list-accent': colorWithAlpha(list.color, ACCENT_ALPHA),
      } as React.CSSProperties)
    : undefined

  return (
    <Link
      to={`/lists/${list.id}`}
      title={list.name}
      style={vars}
      className={`group bg-neps-card border border-neps-border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
        list.color
          ? 'hover:border-[var(--list-accent)] hover:shadow-[0_12px_30px_-5px_var(--list-glow)]'
          : 'hover:border-neps-primary/60 hover:shadow-[0_4px_25px_rgba(56,189,248,0.12)]'
      }`}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#0d121d]">
        {list.urlCover ? (
          <ProtectedImage
            src={list.urlCover}
            alt={list.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neps-input border border-neps-border flex items-center justify-center text-neps-muted mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="text-[10px] font-mono text-neps-muted">
              Sin portada disponible
            </span>
          </div>
        )}

        {list.color && (
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: list.color }}
          />
        )}
      </div>

      <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
            style={{
              backgroundColor: readableBackgroundColor(list.color, PILL_BACKGROUND_ALPHA),
              borderColor: colorWithAlpha(list.color, PILL_BORDER_ALPHA),
              color: readablePillTextColor(list.color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
            }}
          >
            {list.listTypeName}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
            {list.name}
          </h3>
        </div>

        <p className="text-[11px] font-medium text-neps-muted flex items-center gap-1 pt-1 border-t border-neps-border/40">
          <svg
            className="w-3.5 h-3.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {list.workCount} {list.workCount === 1 ? 'obra' : 'obras'}
        </p>

        {hasVisibleRating(list.averageRating) && (
          <p className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
            <span aria-hidden>★</span>
            {list.averageRating.toFixed(1)}
            <span className="text-neps-muted">
              · {list.ratingCount} {list.ratingCount === 1 ? 'voto' : 'votos'}
            </span>
          </p>
        )}

        {hasVisibleProgress(list.readingProgressPercentage) && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-neps-muted">
              <span>Tu avance</span>
              <span className="font-mono font-bold text-emerald-400">{list.readingProgressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-neps-input border border-neps-border rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${list.readingProgressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
