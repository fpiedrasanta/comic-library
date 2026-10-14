import { ProtectedImage } from '@/components/protected-image'
import {
  colorWithAlpha,
  readableBackgroundColor,
  readablePillTextColor,
} from '../utils/entity-color'
import type { CatalogListDetailDto } from '../types/lists'

const CARD_SURFACE = '#131a26'
const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.3
const GLOW_ALPHA = 0.15

interface ListHeaderProps {
  list: CatalogListDetailDto | null
  isLoading: boolean
  notFound: boolean
  error: Error | null
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
 */
export function ListHeader({ list, isLoading, notFound, error }: ListHeaderProps) {
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
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border shadow-sm"
              style={{
                backgroundColor: readableBackgroundColor(list.color, PILL_BACKGROUND_ALPHA),
                borderColor: colorWithAlpha(list.color, PILL_BORDER_ALPHA),
                color: readablePillTextColor(list.color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
              }}
            >
              {list.listTypeName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
            {list.name}
          </h1>

          {list.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {list.description}
            </p>
          )}

          <div className="pt-4 border-t border-neps-border/60 flex items-center justify-center md:justify-start gap-6 text-xs text-neps-muted">
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
          </div>
        </div>
      </div>
    </div>
  )
}
