import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import {
  colorWithAlpha,
  readableAccentColor,
  readableBackgroundColor,
  readablePillTextColor,
} from '../utils/entity-color'
import { EntityLogoFallback } from './entity-logo-fallback'

const CARD_SURFACE = '#131a26'
// Same alpha the WorkCard pills use. At a lower alpha the tint barely moves the
// card surface, so a dark entity color as pill text drops to 1.2:1; at 0.85 the
// surface is effectively black or white and the raw entity color reads on it.
const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.3
const GLOW_ALPHA = 0.15
const GRADIENT_ALPHA = 0.05
const LOGO_SHADOW_ALPHA = 0.1
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i

function displayHost(website: string): string {
  return website.replace(URL_SCHEME, '').replace(/\/+$/, '')
}

/**
 * Accent styling for an entity. The glow, the gradient and the outlines all
 * derive from the stored color; an entity without a color keeps the neutral
 * defaults the helpers already fall back to.
 */
interface EntityAccent {
  color: string
  glow: string
  gradient: string
  border: string
  logoShadow: string
  pillBackground: string
  accentText: string
  /** The entity color adjusted to read as text on its own pill background. */
  pillText: string | undefined
}

function entityAccent(color: string | null): EntityAccent {
  return {
    color: color ?? '',
    glow: colorWithAlpha(color, GLOW_ALPHA),
    gradient: colorWithAlpha(color, GRADIENT_ALPHA),
    border: colorWithAlpha(color, PILL_BORDER_ALPHA),
    logoShadow: `0 10px 15px -3px 0 ${colorWithAlpha(color, LOGO_SHADOW_ALPHA)}`,
    pillBackground: readableBackgroundColor(color, PILL_BACKGROUND_ALPHA),
    accentText: readableAccentColor(color, CARD_SURFACE),
    pillText: readablePillTextColor(color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
  }
}

function presentable(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 shadow-2xl">{children}</div>
}

export interface EntityHeaderProps {
  /** Level of the hierarchy this header represents, e.g. `Editorial`. */
  label: string
  name: string
  color: string | null
  urlImage: string | null
  description: string | null
  /** Short facts shown next to the label pill, e.g. country and founded year. */
  facts?: string[]
  /**
   * A second, clickable pill for the level above. It navigates to that level's
   * own context page, the same as an ancestor, so the header is a way into the
   * hierarchy rather than a summary of it.
   */
  parent?: { label: string; name: string; color: string | null; to: string }
  /**
   * Levels above, each a pill with its own color that navigates to its own
   * context page. A level without a color still renders, with the neutral
   * border, so a missing color never hides the hierarchy.
   */
  ancestors?: { label: string; name: string; to: string; color: string | null }[]
  website?: string | null
  history?: string | null
  isLoading: boolean
  notFound: boolean
  error: Error | null
}

/**
 * Presentation for the contextual catalog headers.
 *
 * The data and the label come from the per-entity hooks, so Publisher,
 * Franchise and Series share one layout and one set of color rules instead of
 * growing a near-identical component each. Every optional field is dropped
 * when it is absent, including the separator between facts.
 */
export function EntityHeader({
  label,
  name,
  color,
  urlImage,
  description,
  facts = [],
  parent,
  ancestors = [],
  website,
  history,
  isLoading,
  notFound,
  error,
}: EntityHeaderProps) {
  const accent = entityAccent(color)
  const lowLabel = label.toLowerCase()

  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-nepsInput/80 border border-nepsBorder animate-pulse flex-shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-5 w-40 bg-nepsInput rounded bg-opacity-60 animate-pulse" />
            <div className="h-8 w-64 bg-nepsInput rounded bg-opacity-60 animate-pulse" />
            <div className="h-4 w-full max-w-3xl bg-nepsInput rounded bg-opacity-40 animate-pulse" />
          </div>
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div className="text-center sm:text-left space-y-1 py-2">
          <h2 className="text-lg font-bold text-white">
            {notFound ? `La ${lowLabel} no existe` : `No se pudo mostrar la ${lowLabel}`}
          </h2>
          <p className="text-xs text-slate-400">{error.message}</p>
        </div>
      </Shell>
    )
  }

  const logoFallback = <EntityLogoFallback name={name} color={color} />
  const visibleFacts = facts.filter((fact) => presentable(fact) != null)
  const visibleAncestors = ancestors.filter((ancestor) => presentable(ancestor.name) != null)
  const visibleDescription = presentable(description)
  const visibleHistory = presentable(history)
  const visibleWebsite = presentable(website)

  return (
    <div className="relative overflow-hidden bg-nepsCard border border-nepsBorder rounded-2xl p-6 shadow-2xl">
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accent.glow }}
      />
      <div
        aria-hidden
        className="absolute top-0 right-0 w-full h-full pointer-events-none"
        style={{ backgroundImage: `linear-gradient(to left, ${accent.gradient}, transparent, transparent)` }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-nepsInput/80 border overflow-hidden flex-shrink-0"
          style={{ borderColor: accent.border, boxShadow: accent.logoShadow }}
        >
          {urlImage ? (
            <ProtectedImage
              src={urlImage}
              alt={name}
              className="w-full h-full object-cover"
              fallback={logoFallback}
            />
          ) : (
            logoFallback
          )}
        </div>

        <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
            <span
              className="font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: accent.pillBackground,
                borderColor: accent.border,
                color: accent.pillText,
              }}
            >
              {label}
            </span>

            {parent && (
              <Link
                to={parent.to}
                title={`${parent.label}: ${parent.name}`}
                style={{
                  backgroundColor: readableBackgroundColor(parent.color, PILL_BACKGROUND_ALPHA),
                  borderColor: colorWithAlpha(parent.color, PILL_BORDER_ALPHA),
                  color: readablePillTextColor(parent.color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
                }}
                className="font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border hover:scale-105 transition-transform"
              >
                {parent.name}
              </Link>
            )}

            {/* The levels above read as one group: no separator between them
                or between them and the level's own pill. Each pill carries its
                own border and color, so a dot only added noise. */}
            {visibleAncestors.map((ancestor) => (
              <Link
                key={ancestor.to}
                to={ancestor.to}
                title={`${ancestor.label}: ${ancestor.name}`}
                style={{
                  backgroundColor: ancestor.color
                    ? readableBackgroundColor(ancestor.color, PILL_BACKGROUND_ALPHA)
                    : undefined,
                  borderColor: colorWithAlpha(ancestor.color, PILL_BORDER_ALPHA),
                  color: readablePillTextColor(ancestor.color, PILL_BACKGROUND_ALPHA, CARD_SURFACE),
                }}
                className={`font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border hover:scale-105 transition-transform ${
                  ancestor.color ? '' : 'border-nepsBorder text-slate-300'
                }`}
              >
                {ancestor.name}
              </Link>
            ))}

            {visibleFacts.map((fact, index) => (
              <span key={fact} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-nepsMuted" aria-hidden>
                    •
                  </span>
                )}
                <span className="text-slate-300 font-medium">{fact}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
              {name}
            </h1>

            {visibleWebsite && (
              <a
                href={visibleWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-nepsPrimary hover:underline bg-nepsInput border border-nepsBorder hover:border-nepsPrimary/50 px-3 py-1.5 rounded-lg transition-all self-center sm:self-auto flex-shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {displayHost(visibleWebsite)}
              </a>
            )}
          </div>

          {visibleDescription && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {visibleDescription}
            </p>
          )}

          {visibleHistory && (
            <details className="group pt-1 text-left">
              <summary
                className="text-xs font-semibold hover:opacity-80 cursor-pointer list-none inline-flex items-center gap-1 transition-opacity"
                style={{ color: accent.accentText }}
              >
                <span>Leer historia completa</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <div className="mt-3 p-3.5 bg-nepsInput/80 border border-nepsBorder rounded-xl text-xs text-slate-400 leading-relaxed max-w-3xl space-y-1">
                <p className="font-semibold text-slate-200">Historia de la {label}:</p>
                <p className="whitespace-pre-line">{visibleHistory}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
