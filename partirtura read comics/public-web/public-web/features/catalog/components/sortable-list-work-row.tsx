import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CatalogListWorkDto } from '../types/lists'
import { ListWorkRow } from './list-work-row'

const CONTROL_CLASS =
  'p-1 rounded-md text-neps-muted hover:text-neps-primary hover:bg-neps-input transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neps-primary'

interface SortableListWorkRowProps {
  work: CatalogListWorkDto
  /** The place the work occupies in the current order of the list. */
  position: number
  listId: number
  /** Moves the work one place up or down in the list. */
  onMove: (direction: -1 | 1) => void
  canMoveUp: boolean
  canMoveDown: boolean
  onRemove: () => void
  /** The work is being removed from the list. */
  isRemoving: boolean
}

/**
 * A work of a personal list, with the controls that order it.
 *
 * The row is dragged by its handle, and it can also be moved one place up or
 * down, which is the alternative that works with a finger and with the
 * keyboard.
 */
export function SortableListWorkRow({
  work,
  position,
  listId,
  onMove,
  canMoveUp,
  canMoveDown,
  onRemove,
  isRemoving,
}: SortableListWorkRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: work.id,
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'relative z-10 opacity-80' : undefined}
    >
      <ListWorkRow
        work={work}
        position={position}
        listId={listId}
        isRemoving={isRemoving}
        onRemove={onRemove}
        reorderControls={
          <>
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label={`Reordenar ${work.title}`}
              className={`${CONTROL_CLASS} cursor-grab active:cursor-grabbing`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 6h2v2H9V6zm4 0h2v2h-2V6zM9 11h2v2H9v-2zm4 0h2v2h-2v-2zM9 16h2v2H9v-2zm4 0h2v2h-2v-2z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={!canMoveUp}
              aria-label={`Subir ${work.title} en la lista`}
              className={CONTROL_CLASS}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={!canMoveDown}
              aria-label={`Bajar ${work.title} en la lista`}
              className={CONTROL_CLASS}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </>
        }
      />
    </div>
  )
}
