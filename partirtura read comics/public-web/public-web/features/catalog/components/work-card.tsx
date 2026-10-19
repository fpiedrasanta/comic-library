import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { WorkCatalogItemDto, EntityChainSelection, HierarchyLevel } from '../types/works'
import { ProtectedImage } from '@/components/protected-image'
import { colorWithAlpha, readableBackgroundColor, readablePillTextColor } from '../utils/entity-color'
import { readingProgressAppearance } from '../utils/reading-progress-color'
import { FavoriteButton } from './favorite-button'
import { ReadingProgressOverlay } from './reading-progress-overlay'

const PILL_BACKGROUND_ALPHA = 0.85
const CARD_SURFACE = '#131a26'
const PILL_BORDER_ALPHA = 0.25
const WORK_TYPE_PILL_BORDER_ALPHA = 0.45
const HIERARCHY_PILL_CLASS = 'text-[9px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-md hover:scale-105 transition-transform truncate max-w-[100px]'
const WORK_TYPE_PILL_CLASS = 'text-[9px] font-extrabold px-1.5 py-0.5 rounded border backdrop-blur-md uppercase tracking-wider'

interface WorkCardProps {
  work: WorkCatalogItemDto
  _onSelectEntity: (selection: EntityChainSelection) => void
  hiddenPills?: HierarchyLevel[]
}

interface EntityPillProps {
  title: string
  color: string
  to: string
  children: React.ReactNode
}

function EntityPill({ title, color, to, children }: EntityPillProps) {
  return (
    <Link
      to={to}
      title={title}
      style={{
        backgroundColor: readableBackgroundColor(color, PILL_BACKGROUND_ALPHA),
        borderColor: colorWithAlpha(color, PILL_BORDER_ALPHA),
        color: readablePillTextColor(color, PILL_BACKGROUND_ALPHA, CARD_SURFACE) ?? color,
      }}
      className={HIERARCHY_PILL_CLASS}
    >
      {children}
    </Link>
  )
}

export function WorkCard({ work, _onSelectEntity, hiddenPills = [] }: WorkCardProps) {
  void _onSelectEntity
  const { publisher, franchise, series } = work
  const show = (level: HierarchyLevel) => !hiddenPills.includes(level)

  const coverUrl = useMemo(() => {
    if (!work.urlCover) return null
    if (work.urlCover.startsWith('http://') || work.urlCover.startsWith('https://') || work.urlCover.startsWith('data:')) {
      return work.urlCover
    }
    return work.urlCover
  }, [work.urlCover])

  const publicationDate = work.publicationDate ? new Date(work.publicationDate) : null
  const uploadedDate = work.createdAt ? new Date(work.createdAt) : null
  const accentColor = work.series?.color ?? work.franchise?.color ?? work.publisher?.color ?? ''
  const readingProgress = work.myReadingProgress ?? null
  const progressAppearance = readingProgress ? readingProgressAppearance(readingProgress) : null

  return (
    <article className="relative group flex flex-col bg-[#131a26] border border-[#2d2c33] hover:border-sky-400/60 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-[0_4px_25px_rgba(56,189,248,0.12)]">
      {/*
        The card opens the work detail, and the star is a control of its own.
        A link that covers the card, with the content above it, keeps both
        actions apart: the star is never inside the link, so clicking it never
        navigates and the keyboard reaches it as a button.
      */}
      <Link
        to={`/works/${work.id}`}
        title={work.title}
        aria-label={`Ver detalle de ${work.title}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400/70"
      />

      <div className="relative z-10 pointer-events-none">
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#0d121d]">
          {coverUrl ? (
            <ProtectedImage
              src={coverUrl}
              alt={work.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div className="absolute inset-0 p-2 z-10 flex flex-col justify-between gap-2 pointer-events-none">
            <div className="flex flex-wrap gap-1 pointer-events-auto">
              {show('publisher') && publisher && (
                <EntityPill
                  title={`Editorial: ${publisher.name}`}
                  color={publisher.color}
                  to={`/publishers/${publisher.id}`}
                >
                  {publisher.name}
                </EntityPill>
              )}

              {show('franchise') && franchise && (
                <EntityPill
                  title={`Franquicia: ${franchise.name}`}
                  color={franchise.color}
                  to={`/franchises/${franchise.id}`}
                >
                  {franchise.name}
                </EntityPill>
              )}

              {show('series') && series && (
                <EntityPill
                  title={`Serie: ${series.name}`}
                  color={series.color}
                  to={`/series/${series.id}`}
                >
                  {series.name}
                </EntityPill>
              )}
            </div>

            <div className="flex justify-end pointer-events-auto">
              {work.workTypeName && (
                <span
                  style={{
                    backgroundColor: readableBackgroundColor(accentColor, PILL_BACKGROUND_ALPHA),
                    borderColor: colorWithAlpha(accentColor, WORK_TYPE_PILL_BORDER_ALPHA),
                    color: readablePillTextColor(accentColor, PILL_BACKGROUND_ALPHA, CARD_SURFACE) ?? accentColor,
                  }}
                  className={WORK_TYPE_PILL_CLASS}
                >
                  {work.workTypeName}
                </span>
              )}
            </div>
          </div>

          {progressAppearance && readingProgress && (
            <ReadingProgressOverlay
              appearance={progressAppearance}
              isCompleted={readingProgress.status === 'Completed'}
            />
          )}
        </div>
      </div>

      <div className="relative z-10 p-3 space-y-2 flex-grow flex flex-col justify-between pointer-events-none">
        <div>
          <div className="min-h-4 flex items-center justify-between gap-2">
            {work.numberValue ? (
              <span className="text-[10px] bg-[#0d121d] text-sky-400 border border-sky-400/30 px-1.5 py-0.2 rounded font-mono font-bold">
                Nº {work.numberValue}
              </span>
            ) : (
              <span className="text-[10px] text-transparent select-none">&nbsp;</span>
            )}

            <div className="pointer-events-auto">
              <FavoriteButton work={work} />
            </div>
          </div>

          <h3 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2 mt-1" title={work.title}>
            {work.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-[#2d2c33]/50 grid grid-cols-2 gap-1 text-[10px] text-slate-400">
          <div>
            <span className="block text-[9px] text-slate-500 uppercase">Publicado</span>
            <strong className="text-slate-300 font-normal">
              {publicationDate ? publicationDate.toLocaleDateString() : '-'}
            </strong>
          </div>
          <div className="text-right">
            <span className="block text-[9px] text-slate-500 uppercase">Subido</span>
            <strong className="text-slate-300 font-normal">
              {uploadedDate ? uploadedDate.toLocaleDateString() : '-'}
            </strong>
          </div>
        </div>
      </div>
    </article>
  )
}
