import { Link } from 'react-router-dom'
import { colorWithAlpha, readableBackgroundColor, readablePillTextColor } from '../utils/entity-color'

const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.25
const CARD_SURFACE = '#131a26'
const PILL_CLASS =
  'pointer-events-auto text-[9px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-md hover:scale-105 transition-transform truncate max-w-full'

const LEVEL_LABELS: Record<string, string> = {
  publisher: 'Editorial',
  franchise: 'Franquicia',
}

export interface EntityPillLinkProps {
  level: 'publisher' | 'franchise'
  name: string
  color: string | null
  /** The detail page of that entity. */
  to: string
}

/**
 * A parent entity as a pill, colored by the entity's own color.
 *
 * In the explore cards the pill navigates to the entity's detail page, the same
 * way the pills of the contextual headers do.
 */
export function EntityPillLink({ level, name, color, to }: EntityPillLinkProps) {
  return (
    <Link
      to={to}
      title={`${LEVEL_LABELS[level] ?? level}: ${name}`}
      style={{
        backgroundColor: readableBackgroundColor(color, PILL_BACKGROUND_ALPHA),
        borderColor: colorWithAlpha(color, PILL_BORDER_ALPHA),
        color: readablePillTextColor(color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
      }}
      className={PILL_CLASS}
    >
      {name}
    </Link>
  )
}
