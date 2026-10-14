import { useWorkForm } from '@/features/works/contexts/work-form-context'
import PersonSearchSelect from '@/features/people/components/person-search-select'
import RoleSearchSelect from '@/features/numbers/components/role-search-select'

interface WorkPersonRolesSectionProps {
  recommendedWriters: string[]
  recommendedArtists: string[]
  recommendedInkers: string[]
  mode?: 'create' | 'edit'
}

export default function WorkPersonRolesSection({
  recommendedWriters,
  recommendedArtists,
  recommendedInkers,
  mode = 'create',
}: WorkPersonRolesSectionProps) {
  const {
    personByRoles,
    pendingPersonId,
    setPendingPersonId,
    pendingRoleId,
    setPendingRoleId,
    setPendingPersonName,
    setPendingRoleName,
    handlers,
    getPersonName,
    getRoleName,
  } = useWorkForm()

  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center font-bold text-sm border border-nepsPrimary/20">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Personas y Roles
            </h2>
            <p className="text-[11px] text-nepsMuted mt-0.5">
              Asociá artistas, guionistas y equipo editorial al número.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlers.handleOpenCreatePersonModal}
            className="px-3 py-1.5 bg-nepsInput hover:bg-nepsBorder text-white border border-nepsBorder font-semibold rounded-lg text-xs transition-all"
          >
            + Persona
          </button>
          <button
            type="button"
            onClick={handlers.handleOpenCreateRoleModal}
            className="px-3 py-1.5 bg-nepsInput hover:bg-nepsBorder text-white border border-nepsBorder font-semibold rounded-lg text-xs transition-all"
          >
            + Rol
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <PersonSearchSelect
            label="Persona"
            value={pendingPersonId}
            onChange={setPendingPersonId}
            onSelectedNameChange={setPendingPersonName}
            showCreateButton
            onCreatePerson={handlers.handleOpenCreatePersonModal}
          />
        </div>
        <div className="flex-1 w-full">
          <RoleSearchSelect
            label="Rol"
            value={pendingRoleId}
            onChange={setPendingRoleId}
            onSelectedNameChange={setPendingRoleName}
            showCreateButton
            onCreateRole={handlers.handleOpenCreateRoleModal}
          />
        </div>
        <div className="w-full sm:w-auto flex-shrink-0">
          <button
            type="button"
            onClick={handlers.handleAddPersonRole}
            disabled={!pendingPersonId || !pendingRoleId}
            className="w-full px-4 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-nepsPrimary flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {personByRoles.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-nepsBorder/60">
          <p className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider">
            Asignaciones ({personByRoles.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {personByRoles.map((pr, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-nepsInput border border-nepsBorder text-slate-300 rounded-lg"
              >
                <span className="text-white font-medium">{getPersonName(pr.personId)}</span>
                <span className="text-nepsMuted">como</span>
                <span className="text-nepsPrimary font-semibold">{getRoleName(pr.roleId)}</span>
                <button
                  type="button"
                  onClick={() => handlers.handleRemovePersonRole(idx)}
                  className="ml-1 text-nepsMuted hover:text-rose-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {(recommendedWriters.length > 0 || recommendedArtists.length > 0 || recommendedInkers.length > 0) && mode === 'edit' && (
        <div className="space-y-3 pt-2 border-t border-nepsBorder/60">
          <p className="text-[10px] text-nepsMuted font-bold uppercase tracking-wider">
            PERSONAS/ROLES DETECTADOS
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendedWriters.map((name) => (
              <button
                key={`writer-${name}`}
                type="button"
                onClick={() => handlers.acceptRecommendedPerson({ personName: name, roleName: 'Escritor' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-sky-500/10 border border-sky-500/30 text-sky-300 rounded-lg hover:bg-sky-500/20 transition-colors"
              >
                {name}
                <span className="text-[10px] text-sky-300/80">— Escritor</span>
              </button>
            ))}
            {recommendedArtists.map((name) => (
              <button
                key={`artist-${name}`}
                type="button"
                onClick={() => handlers.acceptRecommendedPerson({ personName: name, roleName: 'Dibujante' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg hover:bg-amber-500/20 transition-colors"
              >
                {name}
                <span className="text-[10px] text-amber-300/80">— Dibujante</span>
              </button>
            ))}
            {recommendedInkers.map((name) => (
              <button
                key={`inker-${name}`}
                type="button"
                onClick={() => handlers.acceptRecommendedPerson({ personName: name, roleName: 'Entintador' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-lg hover:bg-violet-500/20 transition-colors"
              >
                {name}
                <span className="text-[10px] text-violet-300/80">— Entintador</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
