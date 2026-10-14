import { useWorkForm } from '@/features/works/contexts/work-form-context'

export default function WorkCreateEntityModals() {
  const {
    isCreatePersonModalOpen,
    isCreateRoleModalOpen,
    newPersonName,
    setNewPersonName,
    newRoleName,
    setNewRoleName,
    isCreatingPerson,
    isCreatingRole,
    setIsCreatePersonModalOpen,
    setIsCreateRoleModalOpen,
    handlers,
  } = useWorkForm()

  return (
    <>
      {isCreatePersonModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !isCreatingPerson && setIsCreatePersonModalOpen(false)}
        >
          <div
            className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 border border-nepsPrimary/20 flex items-center justify-center flex-shrink-0 text-nepsPrimary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nueva Persona</h3>
                <p className="text-xs text-nepsMuted mt-0.5">
                  Se creará inmediatamente y quedará seleccionada en el formulario.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="new-person-name" className="text-xs font-semibold text-white block mb-1">
                  Nombre <span className="text-nepsAccent">*</span>
                </label>
                <input
                  id="new-person-name"
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  maxLength={150}
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white rounded-lg px-3 py-2 outline-none"
                  placeholder="Ej: Chris Claremont"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder">
              <button
                type="button"
                onClick={() => setIsCreatePersonModalOpen(false)}
                disabled={isCreatingPerson}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlers.handleCreatePerson}
                disabled={isCreatingPerson || !newPersonName.trim()}
                className="px-4 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isCreatingPerson ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Creando...</span>
                  </>
                ) : (
                  <span>Crear</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateRoleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !isCreatingRole && setIsCreateRoleModalOpen(false)}
        >
          <div
            className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 border border-nepsPrimary/20 flex items-center justify-center flex-shrink-0 text-nepsPrimary">
                <svg className="w-5 h-5" fill="no ne" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nuevo Rol</h3>
                <p className="text-xs text-nepsMuted mt-0.5">
                  Se creará inmediatamente y quedará seleccionado en el formulario.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="new-role-name" className="text-xs font-semibold text-white block mb-1">
                Nombre <span className="text-nepsAccent">*</span>
              </label>
              <input
                id="new-role-name"
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                maxLength={100}
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white rounded-lg px-3 py-2 outline-none"
                placeholder="Ej: Editor, Portadista..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder">
              <button
                type="button"
                onClick={() => setIsCreateRoleModalOpen(false)}
                disabled={isCreatingRole}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlers.handleCreateRole}
                disabled={isCreatingRole || !newRoleName.trim()}
                className="px-4 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isCreatingRole ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Creando...</span>
                  </>
                ) : (
                  <span>Crear</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
