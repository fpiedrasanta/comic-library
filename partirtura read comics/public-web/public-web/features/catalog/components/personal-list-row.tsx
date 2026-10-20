import type { PersonalListMembershipDto } from '../types/lists'

interface PersonalListRowProps {
  list: PersonalListMembershipDto
  /** The membership of the work is being changed. */
  isPending: boolean
  onToggle: (list: PersonalListMembershipDto) => void
  onEdit: (list: PersonalListMembershipDto) => void
  onDelete: (list: PersonalListMembershipDto) => void
}

/**
 * One personal list of the selector: the checkbox of the membership of the
 * work, the name of the list and the actions to rename or delete it.
 */
export function PersonalListRow({
  list,
  isPending,
  onToggle,
  onEdit,
  onDelete,
}: PersonalListRowProps) {
  const checkboxId = `personal-list-${list.id}`

  return (
    <div className="flex items-center justify-between p-2.5 bg-neps-input/60 border border-neps-border hover:border-neps-border/80 rounded-xl transition-colors group">
      <label htmlFor={checkboxId} className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={list.containsWork}
          disabled={isPending}
          onChange={() => onToggle(list)}
          className="w-4 h-4 rounded border-neps-border bg-neps-bg text-neps-primary focus:ring-neps-primary disabled:opacity-60 cursor-pointer"
        />
        <span className="text-xs text-slate-200 font-medium truncate group-hover:text-white">
          {list.name}
        </span>
      </label>

      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-2">
        <button
          type="button"
          onClick={() => onEdit(list)}
          disabled={isPending}
          title="Editar nombre"
          aria-label={`Editar el nombre de ${list.name}`}
          className="p-1 text-neps-muted hover:text-neps-primary rounded transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onDelete(list)}
          disabled={isPending}
          title="Eliminar lista"
          aria-label={`Eliminar la lista ${list.name}`}
          className="p-1 text-neps-muted hover:text-neps-accent rounded transition-colors disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
