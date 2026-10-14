import { readableBackgroundColor, readablePillTextColor } from '../utils/entity-color'

const CARD_SURFACE = '#131a26'
const PILL_BACKGROUND_ALPHA = 0.85

interface EntityLogoFallbackProps {
  name: string
  color: string | null
  /** Overrides the initial size, for boxes smaller than the header logo. */
  className?: string
}

/**
 * Stand-in for a missing entity image: the entity initial on a tinted square.
 *
 * The contextual headers and the explore cards both need this and they have to
 * look the same in both places, so the tint and the initial treatment live here
 * instead of being written twice. Any border belongs to the box that wraps it,
 * since the header already draws one.
 */
export function EntityLogoFallback({ name, color, className = 'text-3xl sm:text-4xl font-extrabold' }: EntityLogoFallbackProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: readableBackgroundColor(color, PILL_BACKGROUND_ALPHA) }}
    >
      <span className={className} style={{ color: readablePillTextColor(color, PILL_BACKGROUND_ALPHA, CARD_SURFACE) }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}
