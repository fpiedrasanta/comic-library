import { useToggleFavorite } from '../hooks/use-favorite'
import type { WorkCatalogItemDto } from '../types/works'

const BUTTON_CLASS =
  'p-1 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70'
const FAVORITE_BUTTON_CLASS = 'bg-amber-400/20 border-amber-400/50 text-amber-400'
const NOT_FAVORITE_BUTTON_CLASS =
  'bg-transparent border-[#2d2c33] text-slate-400 hover:border-amber-400/50 hover:text-amber-400'

interface FavoriteButtonProps {
  work: WorkCatalogItemDto
}

/**
 * The star that marks a work as a favorite of the authenticated user.
 *
 * It is the same control in every listing that shows works, so the state of a
 * work is the same everywhere it appears. The star reflects the state the
 * backend returned with the work and only changes once the operation
 * succeeds: a failed request leaves the previous state and shows the error.
 */
export function FavoriteButton({ work }: FavoriteButtonProps) {
  const { toggle, isPending, error } = useToggleFavorite(work.id, work.isFavorite)

  const isFavorite = work.isFavorite
  const label = isFavorite
    ? `Quitar ${work.title} de favoritos`
    : `Añadir ${work.title} a favoritos`

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={isFavorite}
        aria-label={label}
        title={label}
        className={`${BUTTON_CLASS} ${
          isFavorite ? FAVORITE_BUTTON_CLASS : NOT_FAVORITE_BUTTON_CLASS
        } ${isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </button>

      {error && (
        <p role="alert" className="text-[10px] text-red-400 text-right max-w-[140px] leading-tight">
          {error.message}
        </p>
      )}
    </div>
  )
}
