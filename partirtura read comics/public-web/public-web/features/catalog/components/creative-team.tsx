import type { CatalogWorkDetailDto } from '../types/work-detail'

/**
 * Creative Team section - compact cards grouped by person with role pills.
 */
export function CreativeTeam({ work }: { work: CatalogWorkDetailDto }) {
  const assignments = work.personAssignments ?? []
  if (assignments.length === 0) return null

  // Group by person
  const byPerson = new Map<number, { personName: string; roles: string[] }>()
  assignments.forEach((a) => {
    if (!a.personName || !a.roleName || a.personId == null) return
    const key = a.personId
    const existing = byPerson.get(key)
    if (existing) {
      existing.roles.push(a.roleName)
    } else {
      byPerson.set(key, { personName: a.personName, roles: [a.roleName] })
    }
  })

  const grouped = Array.from(byPerson.values())

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white tracking-tight">Equipo Creativo</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {grouped.map(({ personName, roles }, i) => (
          <div key={`${personName}-${i}`} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="font-semibold text-white text-sm truncate">{personName}</div>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role, j) => (
                <span
                  key={`${role}-${j}`}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/50"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}