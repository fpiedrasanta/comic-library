import type { WorkListDetailDto } from '../types/work-list'

interface WorkListSaveBarProps {
  isSaving: boolean
  serverError: string | null
  onCancel: () => void
}

export default function WorkListSaveBar({
  isSaving,
  serverError,
  onCancel,
}: WorkListSaveBarProps) {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-nepsBorder/60">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 bg-nepsCard hover:bg-nepsBorder border border-nepsBorder text-white text-xs font-semibold rounded-xl transition-all"
      >
        Cancelar
      </button>

      <div className="flex items-center gap-3">
        {serverError && (
          <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-xl px-3 py-2 text-xs text-nepsAccent flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{serverError}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-nepsPrimary hover:bg-sky-400 text-nepsBg font-bold text-xs rounded-xl shadow-lg shadow-nepsPrimary/20 transition-all flex items-center gap-2 disabled:opacity-70"
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
            <span>Guardar Lista</span>
          )}
        </button>
      </div>
    </div>
  )
}

interface WorkListStatusToggleProps {
  mode: 'create' | 'edit'
  workListDetail: WorkListDetailDto | null
  onConfirmAction: (action: 'deactivate' | 'reactivate') => void
}

export function WorkListStatusToggle({
  mode,
  workListDetail,
  onConfirmAction,
}: WorkListStatusToggleProps) {
  if (mode !== 'edit' || !workListDetail) return null

  const isListActive = workListDetail.isActive

  return (
    <div className="flex items-center justify-between border-b border-nepsBorder/60 pb-5 -mx-2">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Editar Lista: {workListDetail.name}
        </h2>
        <p className="text-xs text-nepsMuted mt-1">
          Configurá la información general y gestioná las obras pertenecientes a esta lista curada.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
            isListActive
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-slate-800 border border-slate-700 text-slate-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isListActive ? 'bg-emerald-400' : 'bg-slate-500'}`}
          ></span>
          <span>{isListActive ? 'Activa' : 'Inactiva'}</span>
        </span>
        <button
          type="button"
          onClick={() => onConfirmAction(isListActive ? 'deactivate' : 'reactivate')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isListActive
              ? 'bg-nepsAccent/10 hover:bg-nepsAccent text-nepsAccent hover:text-white border border-nepsAccent/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20'
          }`}
        >
          {isListActive ? 'Desactivar Lista' : 'Reactivar Lista'}
        </button>
      </div>
    </div>
  )
}
