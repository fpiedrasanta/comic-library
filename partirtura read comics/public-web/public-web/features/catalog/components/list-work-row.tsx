import { ProtectedImage } from '@/components/protected-image'
import { hasVisibleProgress } from '../utils/list-metrics'
import type { CatalogListWorkDto } from '../types/lists'

const FULL_PERCENTAGE = 100
const NOT_STARTED_PERCENTAGE = 0
/** Zero padding of the order number, so `1` reads as `01`. */
const POSITION_PAD = 2

/** Reading action of a row, driven by the stored percentage of that work. */
type ListWorkAction = 'read' | 'continue' | 'restart'

const ACTION_LABELS: Record<ListWorkAction, string> = {
  read: 'Leer',
  continue: 'Continuar',
  restart: 'Recomenzar',
}

function resolveAction(percentage: number | null): ListWorkAction {
  if (percentage === null) return 'read'
  if (percentage >= FULL_PERCENTAGE) return 'restart'
  return 'continue'
}

interface ListWorkRowProps {
  work: CatalogListWorkDto
  /** Position inside the list, as delivered by the backend. */
  position: number
}

/**
 * One work of a list, as a row.
 *
 * A composition of its own, different from `WorkCard` on purpose: a list row is
 * a reading position, not a catalog card, so it shows the order, the individual
 * progress and the action that resumes the reading. The row itself does not
 * navigate and cannot be reordered: the order belongs to the list and is defined
 * by the backend.
 */
export function ListWorkRow({ work, position }: ListWorkRowProps) {
  const action = resolveAction(work.readingProgressPercentage)

  const details = [work.publisherName, work.numberValue ? `Nº ${work.numberValue}` : null]
    .filter((detail): detail is string => detail !== null)
    .join(' • ')

  return (
    <article className="group bg-neps-card border border-neps-border hover:border-slate-600 rounded-xl p-3 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200">
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
                work.readingProgressPercentage > NOT_STARTED_PERCENTAGE ? 'text-emerald-400' : 'text-slate-500'
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

      <button
        type="button"
        // The row of a list is not a navigation: it neither opens the reader nor the
        // work detail. How a list is read comes later (TASK-PUBLIC-WEB-0089), so the
        // button only states the reading action of that work for now.
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
        <span className="hidden sm:inline">{ACTION_LABELS[action]}</span>
      </button>
    </article>
  )
}
