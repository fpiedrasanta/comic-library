import { listReadingProgressAppearance } from '@/features/catalog/utils/reading-progress-color'
import type { ListReaderListItemDto } from '../types/list-reader-context'

interface ReaderWorkListItemProps {
  item: ListReaderListItemDto
  isCurrent: boolean
  onSelect: (workId: number) => void
}

export function ReaderWorkListItem({ item, isCurrent, onSelect }: ReaderWorkListItemProps) {
  const { work } = item
  const progress = work.readingProgressPercentage
  const appearance = progress != null ? listReadingProgressAppearance(progress) : null

  const statusColor = appearance
    ? appearance.color
    : '#9ca3af' // gris neutro: sin progreso

  const statusLabel = progress == null ? 'Sin progreso' : `${progress}%`

  return (
    <button
      type="button"
      onClick={() => onSelect(work.id)}
      className={
        'flex items-center gap-3 w-full text-left p-2 rounded-lg ' +
        'hover:bg-neps-input transition border border-transparent ' +
        'focus:outline-none focus:ring-2 focus:ring-neps-primary ' +
        (isCurrent ? 'ring-2 ring-neps-primary border-neps-primary' : '')
      }
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: statusColor,
          boxShadow: appearance ? `0 0 6px ${appearance.glow}` : undefined,
        }}
        aria-label={statusLabel}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{work.title}</p>
        <p className="text-xs text-neps-muted truncate">{work.description ?? ''}</p>
      </div>
      <span
        className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: isCurrent ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
          color: isCurrent ? '#4f46e5' : '#9ca3af',
        }}
      >
        {isCurrent ? 'Actual' : statusLabel}
      </span>
    </button>
  )
}
