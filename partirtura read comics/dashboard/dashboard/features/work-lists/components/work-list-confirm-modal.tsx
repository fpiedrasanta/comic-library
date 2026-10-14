type ConfirmAction = 'deactivate' | 'reactivate' | 'cancel' | null

interface WorkListConfirmModalProps {
  action: ConfirmAction
  isOpen: boolean
  workListName: string
  isSaving: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function WorkListConfirmModal({
  action,
  isOpen,
  workListName,
  isSaving,
  onConfirm,
  onClose,
}: WorkListConfirmModalProps) {
  if (!isOpen || action === null) return null

  const isDeactivate = action === 'deactivate'
  const isCancel = action === 'cancel'

  const title = isCancel
    ? '¿Cancelar cambios?'
    : isDeactivate
      ? '¿Desactivar Lista de Obras?'
      : '¿Reactivar Lista de Obras?'

  const description = isCancel
    ? `Tenés cambios sin guardar en la lista "${workListName}". ¿Estás seguro de que querés cancelar? Se perderán los cambios no guardados.`
    : isDeactivate
      ? `Estás a punto de desactivar la lista "${workListName}". La lista pasará a estado inactivo sin ser eliminada de forma física.`
      : `Estás a punto de reactivar la lista "${workListName}". La lista volverá a estar disponible de forma inmediata.`

  const confirmLabel = isCancel ? 'Cancelar Cambios' : isDeactivate ? 'Desactivar' : 'Reactivar'
  const confirmClass = isCancel
    ? 'bg-nepsAccent hover:bg-rose-600 text-white'
    : isDeactivate
      ? 'bg-nepsAccent hover:bg-rose-600 text-white'
      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className={`bg-nepsCard border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
          isCancel
            ? 'border-nepsAccent/40'
            : isDeactivate
              ? 'border-nepsAccent/40'
              : 'border-emerald-500/40'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isCancel
                ? 'bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent'
                : isDeactivate
                  ? 'bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCancel ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              ) : isDeactivate ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              )}
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-nepsMuted">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder/60">
          <button
            type="button"
            onClick={() => !isSaving && onClose()}
            disabled={isSaving}
            className="px-4 py-2 bg-nepsInput hover:bg-nepsBorder border border-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className={`px-4 py-2 font-bold rounded-xl text-xs transition-all flex items-center gap-2 disabled:opacity-70 ${confirmClass}`}
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 8 0 00-4 4H4z" />
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
