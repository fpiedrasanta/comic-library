import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import { readableAccentColor } from '@/features/catalog/utils/entity-color'
import { readingProgressAppearance } from '@/features/catalog/utils/reading-progress-color'
import type { MyReadingProgressDto } from '@/features/catalog/types/work-detail'
import type { WorkCatalogItemDto } from '@/features/catalog/types/works'

/** Card surface the accent colors are read against. */
const CARD_SURFACE = '#131a26'

interface ContinueReadingCardProps {
  work: WorkCatalogItemDto
  progress: MyReadingProgressDto
}

/**
 * One work in progress of the Continue reading section.
 *
 * Horizontal composition — cover on the left, work data and its progress on the
 * right — different from `WorkCard`, which is a cover grid card. The progress is
 * the one the API returns: nothing is recalculated here, and the whole card
 * resumes the reading at `/works/{id}/read`.
 */
export default function ContinueReadingCard({ work, progress }: ContinueReadingCardProps) {
  const appearance = readingProgressAppearance(progress)
  const publisherColor = work.publisher ? readableAccentColor(work.publisher.color, CARD_SURFACE) : CARD_SURFACE

  return (
    <Link
      to={`/works/${work.id}/read`}
      title={`Continuar ${work.title}`}
      className="bg-neps-card border border-neps-border hover:border-neps-primary/50 rounded-xl p-3.5 transition-all duration-200 group flex gap-4 items-center"
    >
      <div className="w-16 h-24 rounded-lg overflow-hidden border border-neps-border flex-shrink-0 relative shadow-md bg-neps-input">
        <ProtectedImage
          src={work.urlCover}
          alt={work.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        <div>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: publisherColor }}
          >
            {work.publisher?.name ?? 'Sin editorial'}
          </span>
          <h3 className="text-xs font-bold text-white truncate group-hover:text-neps-primary transition-colors">
            {work.title}
          </h3>
        </div>
        <div className="space-y-1">
          <div className="w-full bg-neps-input h-1.5 rounded-full overflow-hidden border border-neps-border">
            <div
              className="h-full rounded-full"
              style={{
                width: `${appearance.percentage}%`,
                backgroundColor: appearance.color,
                boxShadow: `0 0 10px ${appearance.glow}`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-neps-muted">
            <span>{appearance.percentage}% leído</span>
            <span>
              Pág {progress.currentPage}/{progress.totalPages}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
