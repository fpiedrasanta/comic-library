import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import { hasVisibleProgress } from '../utils/list-metrics'
import type { CatalogListWorkDto } from '../types/lists'

const FULL_PERCENTAGE = 100
/** Zero padding of the order number, so `1` reads as `01`. */
const POSITION_PAD = 2

/** Reading action of a row, driven by the stored percentage of that work. */
type ListWorkAction = 'read' | 'continue' | 'restart'

const ACTION_LABELS: Record<ListWorkAction, string> = {
  read: 'Leer',
  continue: 'Continuar',
  restart: 'Recomenzar',
}

const ACTION_BASE_CLASS =
  'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-[11px] font-bold'

function resolveAction(percentage: number | null): ListWorkAction {
  if (percentage === null) return 'read'
  if (percentage >= FULL_PERCENTAGE) return 'restart'
  return 'continue'
}

interface ListWorkRowProps {
  work: CatalogListWorkDto
  /** Position inside the list, as delivered by the backend. */
  position: number
  /** The list the work belongs to, for the reading action route. */
  listId: number
  /**
   * Controls that reorder the row. They are only rendered when the list can
   * be reordered, which is the case of the personal lists of the user.
   */
  reorderControls?: ReactNode
  /** Removes the work from the list, when the list can be edited. */
  onRemove?: () => void
  /** The work is being removed from the list. */
  isRemoving?: boolean
}

/**
 * One work of a list, as a row.
 *
 * A composition of its own, different from `WorkCard` on purpose: a list row is
 * a reading position, not a catalog card, so it shows the order, the individual
 * progress and the action that resumes the reading. The reading action opens the
 * Reader at `/lists/{listId}/work/{workId}`, the contextual route resolved by
 * TASK-PUBLIC-WEB-0093; the row itself does not navigate and does not reorder
 * itself: the order belongs to the list and is defined by the backend.
 *
 * The controls of the personal lists —the reordering and the removal of the
 * work— are optional, so the same row serves the lists of the system.
 */
export function ListWorkRow({
  work,
  position,
  listId,
  reorderControls,
  onRemove,
  isRemoving = false,
}: ListWorkRowProps) {
  const action = resolveAction(work.readingProgressPercentage)
  const isCompleted = work.readingProgressPercentage !== null && work.readingProgressPercentage >= FULL_PERCENTAGE

  const details = [work.publisherName, work.numberValue ? `Nº ${work.numberValue}` : null]
    .filter((detail): detail is string => detail !== null)
    .join(' • ')

  return (
    <article className="group bg-neps-card border border-neps-border hover:border-slate-600 rounded-xl p-3 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200">
      {reorderControls && <div className="flex items-center gap-1 flex-shrink-0">{reorderControls}</div>}

      <span className="font-mono text-xs font-bold text-neps-muted w-6 text-center flex-shrink-0">
        {String(position).padStart(POSITION_PAD, '0')}
      </span>

      <div className="w-10 h-14 bg-neps-input rounded overflow-hidden flex-shrink-0 border border-white/10">
        <ProtectedImage src={work.urlCover} alt={work.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-neps-primary transition-colors">
            {work.title}
          </h3>
          {hasVisibleProgress(work.readingProgressPercentage) && (
            <span
              className={`text-[11px] font-mono font-bold flex-shrink-0 ${
                isCompleted ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {work.readingProgressPercentage}%
            </span>
          )}
        </div>

        {details && <p className="text-[11px] text-neps-muted truncate">{details}</p>}

        {hasVisibleProgress(work.readingProgressPercentage) && (
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${work.readingProgressPercentage}%` }}
            />
          </div>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={isRemoving}
          title="Quitar de la lista"
          aria-label={`Quitar ${work.title} de la lista`}
          className="flex-shrink-0 p-2 rounded-lg text-neps-muted hover:text-neps-accent hover:bg-neps-accent/10 transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}

      <Link
        to={`/lists/${listId}/work/${work.id}`}
        title={ACTION_LABELS[action]}
        className={`${ACTION_BASE_CLASS} ${
          isCompleted
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-slate-700/30 border border-slate-600 text-slate-300 group-hover:bg-slate-700/50'
        }`}
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="hidden sm:inline">{ACTION_LABELS[action]}</span>
      </Link>
    </article>
  )
}
