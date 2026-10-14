interface RoleFormModalProps {
  mode: 'create' | 'edit' | null
  isOpen: boolean
  name: string
  error: string | null
  isSaving: boolean
  onNameChange: (value: string) => void
  onSave: () => void
  onClose: () => void
}

const MAX_NAME_LENGTH = 150

export default function RoleFormModal({
  mode,
  isOpen,
  name,
  error,
  isSaving,
  onNameChange,
  onSave,
  onClose,
}: RoleFormModalProps) {
  if (!isOpen || mode === null) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-nepsBorder/60 pb-3">
          <h3 className="text-base font-bold text-white">
            {mode === 'create' ? 'Nuevo Rol' : 'Editar Rol'}
          </h3>
          <button
            onClick={() => !isSaving && onClose()}
            className="text-nepsMuted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-xl p-3 text-xs text-nepsAccent flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label htmlFor="role-name" className="text-xs font-bold text-white block">
              Nombre <span className="text-nepsAccent">*</span>
            </label>
            <input
              id="role-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Ej. Administrador"
              autoFocus
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-nepsBorder/60">
            <button
              type="button"
              onClick={() => !isSaving && onClose()}
              disabled={isSaving}
              className="px-4 py-2 bg-nepsInput text-nepsMuted hover:text-white border border-nepsBorder font-semibold rounded-xl text-xs transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 8 0 00-4 4H4z" />
                  </svg>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Guardar' : 'Guardar Cambios'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
