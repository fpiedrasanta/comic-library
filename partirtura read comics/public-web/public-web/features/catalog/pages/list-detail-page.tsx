import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ListHeader } from '../components/list-header'
import { ListWorkRow } from '../components/list-work-row'
import { SortableListWorkRow } from '../components/sortable-list-work-row'
import { useCatalogListDetail } from '../hooks/use-list-detail'
import {
  useIsPersonalList,
  usePersonalListWorks,
} from '../hooks/use-personal-list-editing'
import type { CatalogListWorkItemDto } from '../types/lists'

/**
 * Pixels the pointer travels before a drag starts, so a touch on the list can
 * still scroll the page.
 */
const DRAG_ACTIVATION_DISTANCE = 6

/**
 * `/lists/:id`: the detail of a list.
 *
 * The works render as rows, in the order the list itself defines
 * (`WorkListItem.Position`), so the page offers no work filter, no search and no
 * sorting, and never reorders what the backend delivers.
 *
 * A personal list of the user can also be administered: its works can be
 * reordered and removed. The system lists keep their previous behavior, and
 * the reading, the progress and the ratings of the works are the same in both.
 */
export function ListDetailPage({ entityId }: { entityId: number }) {
  const { entity: list, isLoading, notFound, error } = useCatalogListDetail(entityId)
  const { isPersonal } = useIsPersonalList(entityId)
  const { reorder, removeWork } = usePersonalListWorks(entityId)

  /**
   * The order shown while a reordering waits for the backend to confirm it.
   * `null` means that the order of the list is the one of the backend.
   */
  const [pendingWorks, setPendingWorks] = useState<CatalogListWorkItemDto[] | null>(null)

  const works = pendingWorks ?? list?.works ?? []

  // A new answer of the backend replaces the order that was pending.
  useEffect(() => {
    setPendingWorks(null)
  }, [list?.works])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function persistOrder(nextWorks: CatalogListWorkItemDto[]) {
    // Only the works that change their place travel to the backend: the ones
    // that keep their position are not sent and stay where they are.
    const changes = nextWorks
      .map((item, index) => ({ workId: item.work.id, position: index }))
      .filter((change, index) => works[index]?.work.id !== change.workId)

    if (changes.length === 0) {
      setPendingWorks(null)
      return
    }

    reorder.mutate(changes, {
      onError: () => {
        // The confirmed order is the one of the backend.
        setPendingWorks(null)
      },
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = works.findIndex((item) => item.work.id === Number(active.id))
    const newIndex = works.findIndex((item) => item.work.id === Number(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const nextWorks = arrayMove(works, oldIndex, newIndex)
    setPendingWorks(nextWorks)
    persistOrder(nextWorks)
  }

  function handleMove(workId: number, direction: -1 | 1) {
    const oldIndex = works.findIndex((item) => item.work.id === workId)
    const newIndex = oldIndex + direction
    if (oldIndex === -1 || newIndex < 0 || newIndex >= works.length) return

    const nextWorks = arrayMove(works, oldIndex, newIndex)
    setPendingWorks(nextWorks)
    persistOrder(nextWorks)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-10">
      <div>
        <Link
          to={isPersonal ? '/my-lists' : '/lists'}
          className="inline-flex items-center gap-1 text-xs text-neps-muted hover:text-white font-medium"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {isPersonal ? 'Volver a Mis listas' : 'Volver a Exploración de Listas'}
        </Link>
      </div>

      <ListHeader list={list} isLoading={isLoading} notFound={notFound} error={error} />

      {!isLoading && !error && list != null && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-neps-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Obras de la Lista</h2>
              <span className="text-[11px] font-mono text-neps-muted bg-neps-input border border-neps-border px-2 py-0.5 rounded-md">
                Orden de lectura
              </span>
              {isPersonal && (
                <span className="text-[11px] font-mono text-neps-primary bg-neps-primary/10 border border-neps-primary/30 px-2 py-0.5 rounded-md">
                  Podés reordenar y quitar obras
                </span>
              )}
            </div>
          </div>

          {(reorder.error || removeWork.error) && (
            <p role="alert" className="text-xs text-neps-accent">
              {(reorder.error ?? removeWork.error)?.message}
            </p>
          )}

          {works.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs font-bold text-white">Esta lista todavía no tiene obras.</p>
            </div>
          ) : isPersonal ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={works.map((item) => item.work.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {works.map((item, index) => (
                    <SortableListWorkRow
                      key={item.work.id}
                      work={item.work}
                      position={index}
                      listId={list.id}
                      canMoveUp={index > 0}
                      canMoveDown={index < works.length - 1}
                      onMove={(direction) => handleMove(item.work.id, direction)}
                      onRemove={() => removeWork.mutate(item.work.id)}
                      isRemoving={
                        removeWork.isPending && removeWork.variables === item.work.id
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-2.5">
              {works.map((item) => (
                <ListWorkRow
                  key={item.work.id}
                  work={item.work}
                  position={item.position}
                  listId={list.id}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
