import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDebouncedCallback } from '../hooks/use-debounced-callback'
import {
  PERSONAL_LISTS_VISIBLE_STEP,
  usePersonalListActions,
  usePersonalLists,
} from '../hooks/use-personal-lists'
import type { PersonalListMembershipDto } from '../types/lists'
import type { WorkCatalogItemDto } from '../types/works'
import { PersonalListNameDialog } from './personal-list-name-dialog'
import { PersonalListRow } from './personal-list-row'

/** Time the search waits before it asks the backend for the lists. */
const SEARCH_DEBOUNCE_MS = 300

interface PersonalListsModalProps {
  work: WorkCatalogItemDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The personal lists of the user and the membership of a work.
 *
 * Every list has a checkbox with the membership of the work, and the list can
 * be renamed or deleted from the same row. The order of the lists is the one
 * the backend returns: the lists that contain the work first and the rest
 * after them.
 */
export function PersonalListsModal({ work, open, onOpenChange }: PersonalListsModalProps) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PERSONAL_LISTS_VISIBLE_STEP)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [listToEdit, setListToEdit] = useState<PersonalListMembershipDto | null>(null)
  const [listToDelete, setListToDelete] = useState<PersonalListMembershipDto | null>(null)

  const scheduleSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
    setVisibleCount(PERSONAL_LISTS_VISIBLE_STEP)
  }, SEARCH_DEBOUNCE_MS)

  const listsQuery = usePersonalLists(work.id, search)
  const {
    addWork,
    removeWork,
    createList,
    renameList,
    deleteList,
    isMembershipPending,
  } = usePersonalListActions(work.id, search)

  const lists = listsQuery.data ?? []
  const visibleLists = lists.slice(0, visibleCount)
  const hasMoreLists = visibleLists.length < lists.length

  function handleToggle(list: PersonalListMembershipDto) {
    if (list.containsWork) {
      removeWork.mutate(list.id)
      return
    }
    addWork.mutate(list.id)
  }

  function handleCreate(name: string) {
    createList.mutate(name, {
      onSuccess: () => {
        setIsNameDialogOpen(false)
        setVisibleCount(PERSONAL_LISTS_VISIBLE_STEP)
      },
    })
  }

  function handleRename(name: string) {
    if (!listToEdit) return
    renameList.mutate(
      { listId: listToEdit.id, name },
      { onSuccess: () => setListToEdit(null) }
    )
  }

  function handleDelete() {
    if (!listToDelete) return
    deleteList.mutate(listToDelete.id, {
      onSuccess: () => setListToDelete(null),
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle>Agregar a lista</DialogTitle>
            <DialogDescription className="text-neps-primary truncate max-w-[260px]">
              {work.title}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value)
                  scheduleSearch.schedule(event.target.value)
                }}
                placeholder="Buscar lista..."
                aria-label="Buscar lista por nombre"
                className="w-full bg-neps-input border border-neps-border focus:border-neps-primary text-xs text-white placeholder-slate-500 rounded-xl pl-8 pr-3 py-2 outline-none transition-all"
              />
              <svg
                className="w-3.5 h-3.5 text-neps-muted absolute left-2.5 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsNameDialogOpen(true)}
              className="flex-shrink-0"
            >
              <span className="text-sm leading-none">+</span>
              <span className="hidden sm:inline">Nueva</span>
            </Button>
          </div>

          {listsQuery.isLoading && (
            <p className="text-xs text-neps-muted text-center py-6">
              Cargando listas...
            </p>
          )}

          {listsQuery.isError && (
            <div className="text-center py-4 space-y-2">
              <p role="alert" className="text-xs text-neps-accent">
                No se pudieron cargar las listas.
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={() => listsQuery.refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {!listsQuery.isLoading && !listsQuery.isError && lists.length === 0 && (
            <p className="text-xs text-neps-muted text-center py-6">
              {search
                ? 'No hay listas que coincidan con la búsqueda.'
                : 'Todavía no tenés listas personales.'}
            </p>
          )}

          {visibleLists.length > 0 && (
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {visibleLists.map((list) => (
                <PersonalListRow
                  key={list.id}
                  list={list}
                  isPending={isMembershipPending}
                  onToggle={handleToggle}
                  onEdit={setListToEdit}
                  onDelete={setListToDelete}
                />
              ))}
            </div>
          )}

          {lists.length > 0 && (
            <div className="text-center pt-2 border-t border-neps-border space-y-1">
              <p className="text-[11px] text-neps-muted">
                Mostrando {visibleLists.length} de {lists.length}
              </p>
              {hasMoreLists && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PERSONAL_LISTS_VISIBLE_STEP)}
                  className="text-xs text-neps-primary hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
                >
                  <span>Ver más listas</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {(addWork.error || removeWork.error || deleteList.error) && (
            <p role="alert" className="text-[11px] text-neps-accent">
              {(addWork.error ?? removeWork.error ?? deleteList.error)?.message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PersonalListNameDialog
        open={isNameDialogOpen}
        onOpenChange={setIsNameDialogOpen}
        title="Crear lista"
        submitLabel="Guardar"
        isPending={createList.isPending}
        error={createList.error?.message}
        onSubmit={handleCreate}
      />

      <PersonalListNameDialog
        open={listToEdit !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setListToEdit(null)
        }}
        title="Editar nombre"
        initialName={listToEdit?.name ?? ''}
        submitLabel="Guardar"
        isPending={renameList.isPending}
        error={renameList.error?.message}
        onSubmit={handleRename}
      />

      <ConfirmDialog
        open={listToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setListToDelete(null)
        }}
        title="¿Eliminar lista?"
        description={
          <>
            Esta acción eliminará la lista{' '}
            <span className="text-white font-semibold">"{listToDelete?.name}"</span> y perderá todo el
            contenido de obras asociadas a ella.
          </>
        }
        confirmLabel="Sí, eliminar"
        isPending={deleteList.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
