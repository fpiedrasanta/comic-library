import { useNavigate } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import {
  colorWithAlpha,
  readableBackgroundColor,
  readablePillTextColor,
} from '../utils/entity-color'
import { StarRatingDisplay } from './star-rating-display'
import { hasVisibleProgress, hasVisibleRating } from '../utils/list-metrics'
import type { CatalogListDetailDto } from '../types/lists'

const CARD_SURFACE = '#131a26'
const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.3
const GLOW_ALPHA = 0.15
const FULL_PERCENTAGE = 100

/** Reading action of the whole list, driven by the list progress the API returns. */
type ListReadingAction = 'read' | 'continue' | 'restart'

const ACTION_LABELS: Record<ListReadingAction, string> = {
  read: 'Leer',
  continue: 'Continuar leyendo',
  restart: 'Recomenzar',
}

function resolveAction(percentage: number | null): ListReadingAction {
  if (percentage === null) return 'read'
  if (percentage >= FULL_PERCENTAGE) return 'restart'
  return 'continue'
}

interface ListHeaderProps {
  list: CatalogListDetailDto | null
  isLoading: boolean
  notFound: boolean
  error: Error | null
  /** The list is a personal one of the user, which has no type of list. */
  isPersonal?: boolean
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neps-card border border-neps-border rounded-2xl p-6 sm:p-8 shadow-2xl">
      {children}
    </div>
  )
}

/**
 * Header of `/lists/:id`.
 *
 * The cover is a vertical comic cover — `object-cover`, no inner
 * padding, rounded — and the list color accents the bar, the glow
 * and the type pill. The description only exists here: the card of
 * the listing deliberately leaves it out.
 *
 * It also carries the reading state of the list: the progress block
 * with its reading action (only when the API returns a percentage)
 * and the rating, which is shown only when the average is a valid
 * score.
 */
export function ListHeader({ list, isLoading, notFound, error, isPersonal = false }: ListHeaderProps) {
  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          <div className="w-44 sm:w-52 md:w-60 aspect-[2/3] rounded-2xl bg-neps-input/80 border border-neps-border animate-pulse flex-shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-5 w-32 bg-neps-input rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-neps-input rounded animate-pulse" />
            <div className="h-4 w-full max-w-3xl bg-neps-input rounded animate-pulse" />
          </div>
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="text-center md:text-left space-y-1 py-2">
          <h1 className="text-lg font-bold text-white">
            {notFound ? 'La lista no existe' : 'No se pudo mostrar la lista'}
          </h1>
          <p className="text-xs text-slate-400">{error.message}</p>
        </div>
      </Shell>
    )
  }

  if (!list) return null

  const accent = list.color ?? ''
  // A personal list has no type of list, so the pill says what it is.
  const typeLabel = isPersonal ? 'Lista personal' : list.listTypeName

  return (
    <div className="relative bg-neps-card border border-neps-border rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: colorWithAlpha(accent, GLOW_ALPHA) }}
      />

      {accent && (
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: accent }}
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        <div className="w-44 sm:w-52 md:w-60 flex-shrink-0">
          <div className="w-full aspect-[2/3] bg-[#0d121d] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {list.urlCover ? (
              <ProtectedImage
                src={list.urlCover}
                alt={list.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#0d121d] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-neps-input border border-neps-border flex items-center justify-center text-neps-muted mb-3">
                  <svg
                    className="w-8 h-8"
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
                <span className="text-xs font-mono text-neps-muted">Sin portada</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {typeLabel && (
              <span
                className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border shadow-sm"
                style={{
                  backgroundColor: readableBackgroundColor(list.color, PILL_BACKGROUND_ALPHA),
                  borderColor: colorWithAlpha(list.color, PILL_BORDER_ALPHA),
                  color: readablePillTextColor(list.color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
                }}
              >
                {typeLabel}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
            {list.name}
          </h1>

          {list.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {list.description}
            </p>
          )}

          {hasVisibleProgress(list.readingProgressPercentage) ? (
            <ListProgressBlock
              percentage={list.readingProgressPercentage}
              listId={list.id}
              currentWorkId={list.currentWorkId ?? null}
            />
          ) : (
            <div className="flex justify-center md:justify-start">
              <ListReadingButton
                action={resolveAction(list.readingProgressPercentage)}
                listId={list.id}
                currentWorkId={list.currentWorkId ?? null}
              />
            </div>
          )}

          <div className="pt-4 border-t border-neps-border/60 flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-neps-muted">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-neps-input border border-neps-border flex items-center justify-center text-slate-300">
                <svg
                  className="w-4 h-4"
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
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-neps-muted">
                  Contenido
                </span>
                <span className="text-sm font-bold text-white">
                  {list.workCount} {list.workCount === 1 ? 'obra' : 'obras'}
                </span>
              </div>
            </div>

            {hasVisibleRating(list.averageRating) && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neps-input border border-neps-border flex items-center justify-center text-amber-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-neps-muted">
                    Valoración
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StarRatingDisplay averageRating={list.averageRating} size={13} showValue />
                    <span className="text-sm font-bold text-white">
                      · {list.ratingCount} {list.ratingCount === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ListReadingButton({ action, listId, currentWorkId }: {
  action: ListReadingAction
  listId: number
  currentWorkId: number | null
}) {
  const navigate = useNavigate()
  const disabled = currentWorkId === null

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (currentWorkId) navigate(`/lists/${listId}/work/${currentWorkId}`)
      }}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-lg shadow-emerald-500/10 ${
        disabled
          ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
      }`}
      aria-label={disabled ? `${ACTION_LABELS[action]} (no hay obra actual)` : ACTION_LABELS[action]}
    >
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      {ACTION_LABELS[action]}
    </button>
  )
}

/**
 * Progress of the list, with the action that resumes it. The percentage comes
 * from the API: it is never recalculated, and a `null` never reaches this block
 * because there is nothing to report about the progress in that case.
 */
function ListProgressBlock({ percentage, listId, currentWorkId }: {
  percentage: number
  listId: number
  currentWorkId: number | null
}) {
  const action = resolveAction(percentage)

  return (
    <div className="bg-neps-input/60 border border-neps-border/80 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-neps-muted font-medium">Avance de la lista</span>
        <span className="text-emerald-400 font-bold font-mono">{percentage}%</span>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-center md:justify-end pt-1">
        <ListReadingButton action={action} listId={listId} currentWorkId={currentWorkId} />
      </div>
    </div>
  )
}
