import { colorWithAlpha } from '../utils/entity-color'
import type { ReadingProgressAppearance } from '../utils/reading-progress-color'

const PROGRESS_BADGE_BORDER_ALPHA = 0.4

interface ReadingProgressOverlayProps {
  appearance: ReadingProgressAppearance
  /** When true the badge renders `✓ LEÍDO`; otherwise `{percentage}%`. */
  isCompleted: boolean
}

/**
 * Shared reading-progress overlay used by `WorkCard` and `ListCard`.
 *
 * Sits at the bottom of the cover: a backdrop-blurred badge with the
 * percentage (or `✓ LEÍDO` when completed) on the left, and a 1px progress
 * bar spanning the full width on the bottom edge. The color travels amber→
 * orange while reading and emerald on completion, matching `WorkCard`.
 */
export function ReadingProgressOverlay({ appearance, isCompleted }: ReadingProgressOverlayProps) {
  return (
    <>
      <div className="absolute bottom-3 left-2 z-20 pointer-events-none">
        <span
          style={{
            borderColor: colorWithAlpha(appearance.color, PROGRESS_BADGE_BORDER_ALPHA),
            color: appearance.color,
          }}
          className="bg-[#0b0f19]/85 backdrop-blur-md border text-[9px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md whitespace-nowrap"
        >
          {isCompleted ? (
            '✓ LEÍDO'
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {appearance.percentage}%
            </>
          )}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60 z-20 pointer-events-none">
        <div
          className="h-full"
          style={{
            width: `${appearance.percentage}%`,
            backgroundColor: appearance.color,
            boxShadow: `0 0 10px ${appearance.glow}`,
          }}
        />
      </div>
    </>
  )
}
