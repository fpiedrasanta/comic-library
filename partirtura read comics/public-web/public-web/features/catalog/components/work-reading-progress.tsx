import { useNavigate } from 'react-router-dom'
import type { MyReadingProgressDto } from '../types/work-detail'

const MIN_PERCENTAGE = 0
const FULL_PERCENTAGE = 100

const ACTION_BUTTON_CLASS =
  'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/30 hover:bg-brand-500/20 hover:border-brand-400/50 transition'

interface WorkReadingProgressProps {
  workId: number
  progress: MyReadingProgressDto | null
}

function clampPercentage(percentage: number): number {
  return Math.min(FULL_PERCENTAGE, Math.max(MIN_PERCENTAGE, percentage))
}

function ReadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

function ContinueIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

function ActionButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={ACTION_BUTTON_CLASS}>
      {icon}
      {label}
    </button>
  )
}

/**
 * Reading progress of `/works/:id`, shown under the cover.
 *
 * Without progress it only renders the **Leer** action. With progress it adds the
 * progress card (percentage, bar, current page / total) and the contextual
 * action: **Continuar** for `Reading` and **Recomenzar** for `Completed`. Both
 * actions just open the existing Reader, which resumes at the stored position,
 * so the persisted progress is never reset or modified from here.
 */
export function WorkReadingProgress({ workId, progress }: WorkReadingProgressProps) {
  const navigate = useNavigate()
  const openReader = () => navigate(`/works/${workId}/read`)

  if (!progress) {
    return <ActionButton label="Leer" icon={<ReadIcon />} onClick={openReader} />
  }

  const isCompleted = progress.status === 'Completed'
  const clampedPercentage = clampPercentage(progress.percentage)
  // The final position stored when a Work is completed is `totalPages + 1`,
  // so it is clamped to keep the reading label consistent with the total.
  const displayPage = Math.min(progress.currentPage, progress.totalPages)

  return (
    <div className="space-y-3">
      <div className="bg-neps-input/60 border border-neps-border rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neps-muted font-medium">Tu avance</span>
          <span className="text-neps-primary font-bold font-mono">{Math.round(clampedPercentage)}%</span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden border border-neps-border/80 bg-neps-bg p-0.5"
          role="progressbar"
          aria-label="Progreso de lectura"
          aria-valuemin={MIN_PERCENTAGE}
          aria-valuemax={FULL_PERCENTAGE}
          aria-valuenow={Math.round(clampedPercentage)}
        >
          <div
            className="bg-neps-primary h-full rounded-full transition-all duration-500 shadow-glow-blue"
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
        <div className="flex items-center text-[10px] text-neps-muted font-mono pt-0.5">
          <span>
            Pág {displayPage} de {progress.totalPages}
          </span>
        </div>
      </div>

      <ActionButton
        label={isCompleted ? 'Recomenzar' : 'Continuar'}
        icon={isCompleted ? <RestartIcon /> : <ContinueIcon />}
        onClick={openReader}
      />
    </div>
  )
}
