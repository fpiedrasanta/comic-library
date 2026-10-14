import { useWorkForm } from '@/features/works/contexts/work-form-context'

interface WorkSaveBarProps {
  mode?: 'create' | 'edit'
}

export default function WorkSaveBar({ mode = 'edit' }: WorkSaveBarProps) {
  const {
    isSaving,
    isConfirmOpen,
    setIsConfirmOpen,
    handlers,
  } = useWorkForm()

  return (
    <>
      <div className="border-t border-nepsBorder/60 pt-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={handlers.handleCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-5 py-2.5 bg-nepsInput hover:bg-nepsBorder text-nepsMuted hover:text-white border border-nepsBorder font-semibold rounded-xl text-xs transition-all disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-nepsPrimary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>{mode === 'create' ? 'Guardar Obra' : 'Guardar'}</span>
            </>
          )}
        </button>
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsPrimary/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 border border-nepsPrimary/20 flex items-center justify-center flex-shrink-0 text-nepsPrimary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Confirmar guardado?</h3>
                <p className="text-xs text-nepsMuted mt-1">
                  Se registrarán los cambios de la obra.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Asegurate de que los datos, las personas/roles y las etiquetas sean correctos antes de continuar.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlers.handleConfirmSave}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Confirmar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
