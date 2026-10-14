import type { PersonByRoleDto } from '../types/work-detail'

interface PersonAssignmentsProps {
  assignments: PersonByRoleDto[]
}

/**
 * Displays the list of person-role assignments for a work.
 * Each assignment is shown separately (same person can appear multiple times
 * with different roles).
 */
export function PersonAssignments({ assignments }: PersonAssignmentsProps) {
  if (!assignments || assignments.length === 0) return null

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span>Asignaciones ({assignments.length})</span>
        <span className="text-xs font-mono font-normal text-neps-muted px-2 py-0.5 rounded bg-neps-input border border-neps-border">
          Persona + Rol
        </span>
      </h3>

      <div className="space-y-2">
        {assignments.map((assignment, index) => (
          <div
            key={`${assignment.personId}-${assignment.roleId}-${index}`}
            className="flex items-center gap-3 p-3 bg-neps-card/50 border border-neps-border/60 rounded-xl"
          >
            <div className="w-8 h-8 rounded-full bg-neps-input border border-neps-border flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-neps-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {assignment.personName ?? 'Persona desconocida'}
              </div>
              <div className="text-xs text-neps-muted truncate">
                {assignment.roleName ?? 'Rol desconocido'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}