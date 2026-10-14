import { useWorkForm } from '@/features/works/contexts/work-form-context'

const MAX_CBR_SIZE_MB = 300

interface WorkContentSectionProps {
  mode: 'create' | 'edit'
}

export default function WorkContentSection({
  mode,
}: WorkContentSectionProps) {
  const {
    workData,
    cbrFile,
    cbrError,
    isUploadingCbr,
    isDeletingContent,
    isRetrying,
    images,
    handlers,
  } = useWorkForm()

  const contentStatus = workData?.contentStatus

  return (
    <div className="space-y-4">
      {workData?.contentError && contentStatus === 3 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-[11px] text-rose-300">
          <strong>Error de procesamiento:</strong> {workData.contentError}
        </div>
      )}

      {mode === 'create' ? (
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center font-bold text-xs border border-nepsPrimary/20">
                1
              </div>
              <h2 className="text-sm font-bold text-white">Carga de Archivo Digital (CBR / CBZ)</h2>
            </div>
            <div className="text-xs text-nepsMuted">
              Formatos aceptados: <strong className="text-slate-300">.cbr, .cbz</strong>
            </div>
          </div>

          <label className="border-2 border-dashed border-nepsBorder hover:border-nepsPrimary/60 bg-nepsInput/50 rounded-xl p-8 text-center cursor-pointer transition-colors block">
            <input
              type="file"
              accept=".cbr,.cbz,application/x-cbr,application/x-cbz,application/zip,application/x-rar-compressed"
              onChange={handlers.handleCbrChange}
              className="hidden"
              disabled={isUploadingCbr}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-nepsCard border border-nepsBorder rounded-xl flex items-center justify-center text-nepsMuted">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Arrastrá tu archivo CBR/CBZ aquí o <span className="text-nepsPrimary underline cursor-pointer">explorá tu equipo</span>
                </p>
                <p className="text-xs text-nepsMuted mt-1">Tamaño máximo recomendado: {MAX_CBR_SIZE_MB}MB</p>
                {cbrFile && !isUploadingCbr && (
                  <p className="text-xs text-nepsPrimary font-medium mt-2">
                    Seleccionado: {cbrFile.name}
                  </p>
                )}
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center font-bold text-xs border border-nepsPrimary/20">
                  1
                </div>
                <h2 className="text-sm font-bold text-white">Carga de Archivo Digital (CBR / CBZ)</h2>
              </div>
              <div className="text-xs text-nepsMuted">
                Formatos aceptados: <strong className="text-slate-300">.cbr, .cbz</strong>
              </div>
            </div>

            <label className="border-2 border-dashed border-nepsBorder hover:border-nepsPrimary/60 bg-nepsInput/50 rounded-xl p-8 text-center cursor-pointer transition-colors block">
              <input
                type="file"
                accept=".cbr,.cbz,application/x-cbr,application/x-cbz,application/zip,application/x-rar-compressed"
                onChange={(e) => {
                  handlers.handleCbrChange(e)
                  if (e.target.files?.[0]) {
                    handlers.handleRetryContent()
                  }
                }}
                className="hidden"
                disabled={isUploadingCbr}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-nepsCard border border-nepsBorder rounded-xl flex items-center justify-center text-nepsMuted">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Arrastrá tu archivo CBR/CBZ aquí o <span className="text-nepsPrimary underline cursor-pointer">explorá tu equipo</span>
                  </p>
                  <p className="text-xs text-nepsMuted mt-1">Tamaño máximo recomendado: {MAX_CBR_SIZE_MB}MB</p>
                  {cbrFile && !isUploadingCbr && (
                    <p className="text-xs text-nepsPrimary font-medium mt-2">
                      Seleccionado: {cbrFile.name}
                    </p>
                  )}
                </div>
              </div>
            </label>

            <div className="flex items-center gap-2">
              {contentStatus === 3 && (
                <button
                  type="button"
                  onClick={handlers.handleRetryContent}
                  disabled={isRetrying}
                  className="border border-amber-500/30 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl p-2 text-center transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isRetrying ? (
                    <svg className="w-3.5 h-3.5 animate-spin text-amber-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span className="text-xs font-semibold text-amber-300">Reintentar</span>
                </button>
              )}
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={handlers.handleDeleteContent}
                  disabled={isDeletingContent}
                  className="border border-rose-500/30 hover:border-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl p-2 text-center transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeletingContent ? (
                    <svg className="w-3.5 h-3.5 animate-spin text-rose-300" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  <span className="text-xs font-semibold text-rose-300">Eliminar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {cbrError && <p className="text-[11px] text-nepsAccent">{cbrError}</p>}
    </div>
  )
}
