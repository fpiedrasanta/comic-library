import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import {
  colorWithAlpha,
  readableBackgroundColor,
  readablePillTextColor,
} from '../utils/entity-color'
import type { CatalogWorkContextDto } from '../types/work-detail'

function parseColor(color: string | null): [number, number, number] | null {
  if (!color) return null
  const hex = color.startsWith('#') ? color.slice(1) : color
  if (hex.length !== 6) return null
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]
}

const CARD_SURFACE = '#131a26'
const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.3
const GLOW_ALPHA = 0.15

interface WorkContextProps {
  label: string
  context: CatalogWorkContextDto | null
  to: string
}

/**
 * A single editorial context (Publisher, Franchise, or Series) shown as a
 * clickable card with cover, name, and colored accent pill.
 * Reuses the same visual language as the contextual headers and explore cards.
 */
export function WorkContext({ label, context, to }: WorkContextProps) {
  if (!context) return null

  const parsedColor = parseColor(context.color)
  const glowColor = parsedColor
    ? `rgba(${parsedColor.join(', ')}, ${GLOW_ALPHA})`
    : 'transparent'

  return (
    <Link
      to={to}
      className="group relative flex flex-col items-center gap-2 w-full sm:w-40 md:w-48"
      style={{ '--ctx-glow': glowColor } as React.CSSProperties}
    >
      <div className="w-full aspect-[2/3] bg-[#0d121d] rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:shadow-[0_8px_25px_-5px_var(--ctx-glow)] transition-shadow duration-300">
        {context.urlCover ? (
          <ProtectedImage
            src={context.urlCover}
            alt={context.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-neps-input border border-neps-border flex items-center justify-center text-neps-muted mb-1">
              <svg
                className="w-5 h-5"
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
            <span className="text-[9px] font-mono text-neps-muted">Sin portada</span>
          </div>
        )}
        {context.color && (
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: context.color }}
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm"
          style={{
            backgroundColor: readableBackgroundColor(context.color, PILL_BACKGROUND_ALPHA),
            borderColor: colorWithAlpha(context.color, PILL_BORDER_ALPHA),
            color: readablePillTextColor(context.color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
          }}
        >
          {label}
        </span>
        <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
          {context.name}
        </span>
      </div>
    </Link>
  )
}