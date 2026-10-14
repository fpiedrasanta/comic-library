import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import {
  colorWithAlpha,
  readableBackgroundColor,
  readablePillTextColor,
} from '../utils/entity-color'
import { StarRatingDisplay } from './star-rating-display'
import { WorkReadingProgress } from './work-reading-progress'
import type { CatalogWorkDetailDto } from '../types/work-detail'

const CARD_SURFACE = '#131a26'
const PILL_BACKGROUND_ALPHA = 0.85
const PILL_BORDER_ALPHA = 0.25
const WORK_TYPE_PILL_BORDER_ALPHA = 0.45
const WORK_TYPE_PILL_CLASS = 'text-[9px] font-extrabold px-1.5 py-0.5 rounded border backdrop-blur-md uppercase tracking-wider'
const GLOW_ALPHA = 0.15

function parseColor(color: string | null): [number, number, number] | null {
  if (!color) return null
  const hex = color.startsWith('#') ? color.slice(1) : color
  if (hex.length !== 6) return null
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neps-card border border-neps-border rounded-2xl p-6 sm:p-8 shadow-2xl">
      {children}
    </div>
  )
}

/**
 * Header of `/works/:id`.
 * Cover, title, work type & number below cover, description, language, publication date,
 * contextual pills (Publisher, Franchise, Series).
 */
export function WorkHeader({ work, isLoading, notFound, error }: {
  work: CatalogWorkDetailDto | null
  isLoading: boolean
  notFound: boolean
  error: Error | null
}) {
  if (isLoading) {
    return (
      <Shell>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="w-full aspect-[2/3] bg-neps-input/80 border border-neps-border rounded-xl animate-pulse" />
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="h-6 w-24 bg-neps-input rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-neps-input rounded-lg animate-pulse" />
            <div className="flex gap-3">
              <div className="h-8 w-28 bg-neps-input rounded-lg animate-pulse" />
              <div className="h-8 w-36 bg-neps-input rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-4 w-full bg-neps-input rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-neps-input rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-neps-input rounded animate-pulse" />
            </div>
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
            {notFound ? 'La obra no existe' : 'No se pudo mostrar la obra'}
          </h1>
          <p className="text-xs text-slate-400">{error.message}</p>
        </div>
      </Shell>
    )
  }

  if (!work) return null

  const coverColor = work.series?.color ?? work.franchise?.color ?? work.publisher?.color ?? ''
  const parsedCoverColor = parseColor(coverColor)
  const glowColor = parsedCoverColor
    ? `rgba(${parsedCoverColor.join(', ')}, ${GLOW_ALPHA})`
    : 'transparent'

  // Build contextual pills: Publisher, Franchise, Series with navigation
  const contextPills = [
    {
      key: 'publisher',
      label: work.publisher?.name ?? 'Editorial',
      color: work.publisher?.color ?? '#ef4444',
      hasEntity: !!work.publisher,
      to: work.publisher ? `/publishers/${work.publisher.id}` : '#',
    },
    {
      key: 'franchise',
      label: work.franchise?.name ?? 'Franquicia',
      color: work.franchise?.color ?? '#f59e0b',
      hasEntity: !!work.franchise,
      to: work.franchise ? `/franchises/${work.franchise.id}` : '#',
    },
    {
      key: 'series',
      label: work.series?.name ?? 'Serie',
      color: work.series?.color ?? '#0ea5e9',
      hasEntity: !!work.series,
      to: work.series ? `/series/${work.series.id}` : '#',
    },
  ].filter((p) => p.hasEntity)

  // Build compact person-role pills for header (differentiated with brand color)
  const personRolePills = work.personAssignments
    ?.filter((a) => a.personName && a.roleName)
    .map((a, i) => ({
      key: `${a.personId}-${a.roleId}-${i}`,
      label: `${a.personName} · ${a.roleName}`,
      search: a.personName!,
    })) ?? []

  // Build compact tag pills for header (differentiated with slate/gray)
  const tagPills = work.tags
    ?.filter((t) => t.name)
    .map((t, i) => ({
      key: `${t.id}-${i}`,
      label: t.name!,
    })) ?? []

  return (
    <div className="relative bg-neps-card border border-neps-border rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
      {coverColor && (
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />
      )}

      {coverColor && (
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: coverColor }}
        />
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Cover */}
        <div className="md:col-span-4 lg:col-span-3 flex justify-center">
          <div className="relative group w-full max-w-[280px] md:max-w-none">
            <div
              className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500 pointer-events-none"
              style={coverColor ? { background: `linear-gradient(to right, ${colorWithAlpha(coverColor, 0.4)}, ${colorWithAlpha(coverColor, 0.2)})` } : {}}
            />
            <div className="relative w-full aspect-[2/3] object-cover rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
              {work.urlCover ? (
                <ProtectedImage
                  src={work.urlCover}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
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

              {/* WorkType pill overlaid on cover, bottom-right */}
              {work.workType && coverColor && (
                <div className="absolute inset-0 p-2 z-20 flex flex-col justify-end items-end pointer-events-none">
                  <span
                    style={{
                      backgroundColor: readableBackgroundColor(coverColor, PILL_BACKGROUND_ALPHA),
                      borderColor: colorWithAlpha(coverColor, WORK_TYPE_PILL_BORDER_ALPHA),
                      color: readablePillTextColor(coverColor, PILL_BACKGROUND_ALPHA, CARD_SURFACE) ?? coverColor,
                    }}
                    className={WORK_TYPE_PILL_CLASS}
                  >
                    {work.workType.name}
                  </span>
                </div>
              )}
            </div>

            {/* Number, reading progress and contextual read action BELOW the cover - full width of cover */}
            <div className="w-full mt-3 space-y-2">
              {work.numberValue && (
                <span className="inline-flex items-center gap-1 px-3 py-2 rounded-md border bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold font-mono w-full justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Nº {work.numberValue}
                </span>
              )}
              <WorkReadingProgress workId={work.id} progress={work.myReadingProgress ?? null} />
            </div>
          </div>
        </div>

        {/* Metadata & Description */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {work.title}
          </h1>

          {/* Average Rating */}
          {(work.averageRating !== null || work.ratingCount > 0) && (
            <div className="flex items-center gap-2 pt-1">
              <StarRatingDisplay averageRating={work.averageRating} size={18} showValue />
              <span className="text-sm text-slate-400">{work.ratingCount} voto{work.ratingCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Language & PublicationDate */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 pt-1">
            {work.language && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-2.907 3-6.428M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{work.language.name}</span>
              </span>
            )}
            {work.publicationDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(work.publicationDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </span>
            )}
          </div>

          {/* Description / Synopsis */}
          {work.description && (
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinopsis</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {work.description}
              </p>
            </div>
          )}

          {/* Context Pills (Publisher, Franchise, Series) + Person Pills + Tag Pills */}
          {(contextPills.length > 0 || personRolePills.length > 0 || tagPills.length > 0) && (
            <div className="space-y-2 pt-2">
              {/* Context pills - with WorkCard contrast style */}
              {contextPills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contextPills.map(({ key, label, color, to }) => (
                    <Link
                      key={key}
                      to={to}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md"
                      style={{
                        backgroundColor: readableBackgroundColor(color, PILL_BACKGROUND_ALPHA),
                        borderColor: colorWithAlpha(color, PILL_BORDER_ALPHA),
                        color: readablePillTextColor(color, PILL_BACKGROUND_ALPHA, CARD_SURFACE) ?? color,
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Person pills - brand color */}
              {personRolePills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {personRolePills.map(({ key, label, search }) => (
                    <Link
                      key={key}
                      to={`/catalog?search=${encodeURIComponent(search)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:border-brand-400/40 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Tag pills - slate/gray */}
              {tagPills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagPills.map(({ key, label }) => (
                    <Link
                      key={key}
                      to={`/catalog?search=${encodeURIComponent(label)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}