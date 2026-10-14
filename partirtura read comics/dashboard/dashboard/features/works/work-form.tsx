import { useWorkForm } from '@/features/works/contexts/work-form-context'
import WorkAlerts from '@/features/works/components/work-alerts'
import WorkContentSection from '@/features/works/components/work-content-section'
import WorkBasicInfoSection from '@/features/works/components/work-basic-info-section'
import WorkSaveBar from '@/features/works/components/work-save-bar'
import WorkAiResultsSection, { type AiResult } from '@/features/works/components/work-ai-results-section'
import WorkNumberValuesSection from '@/features/works/components/work-numbering-section'
import WorkPersonRolesSection from '@/features/works/components/work-person-roles-section'
import WorkTagsSection from '@/features/works/components/work-tags-section'
import { ContentStatusLabel } from '@/types/works'
import { cn } from '@/lib/utils'
import { ProtectedImage } from '@/components/protected-image'

export default function WorkForm() {
  const {
    mode,
    workData,
    setServerError,
    setIsConfirmOpen,
    lastAiResult,
    recommendedWriters,
    recommendedArtists,
    recommendedInkers,
    recommendedGeneralTags,
    recommendedCharacters,
  } = useWorkForm()

  const aiResult: AiResult | null =
    mode === 'edit' && lastAiResult
      ? {
          title: lastAiResult.title ?? null,
          number: lastAiResult.number ?? null,
          description: lastAiResult.description ?? null,
          summary: lastAiResult.summary ?? null,
          publisher: lastAiResult.publisher ?? null,
          publicationDate: lastAiResult.publicationDate ?? null,
          writers: lastAiResult.writers,
          artists: lastAiResult.artists,
          inkers: lastAiResult.inkers,
          tags: lastAiResult.tags,
          characters: lastAiResult.characters,
        }
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setIsConfirmOpen(true)
  }

  const getContentStatusBadge = () => {
    if (mode === 'create') {
      return (
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
          ContentStatus:{' '}
          <strong className="text-slate-400">Missing</strong>
        </span>
      )
    }

    if (!workData || workData.contentStatus === undefined) {
      return (
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
          ContentStatus:{' '}
          <strong className="text-slate-400">Missing</strong>
        </span>
      )
    }

    const status = workData.contentStatus
    const colorClass =
      status === 1
        ? 'text-amber-400'
        : status === 2
          ? 'text-emerald-400'
          : status === 3
            ? 'text-rose-400'
            : 'text-slate-400'

    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold">
        ContentStatus:{' '}
        <strong className={colorClass}>{ContentStatusLabel[status]}</strong>
      </span>
    )
  }

  const getActiveBadge = () => {
    if (mode === 'create') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full border font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          Activo
        </span>
      )
    }

    if (!workData) return null

    return (
      <span
        className={cn(
          'text-[10px] px-2 py-0.5 rounded-full border font-bold',
          workData.isActive
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-nepsInput text-slate-300 border-nepsBorder',
        )}
      >
        {workData.isActive ? 'Activo' : 'Inactivo'}
      </span>
    )
  }

  return (
    <>
      <WorkAlerts />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-4">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {mode === 'create' ? 'Nuevo Número' : `Editando ${workData?.title || 'Obra'}`}
              </h1>
              <p className="text-xs text-nepsMuted mt-0.5">
                {mode === 'create'
                  ? 'Subí el archivo digital para extracción automática o cargá directamente la ficha editorial.'
                  : 'Subí un archivo nuevo para reemplazar el actual.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getContentStatusBadge()}
              {getActiveBadge()}
            </div>
          </div>

          <WorkBasicInfoSection mode={mode} />
        </div>

        <WorkContentSection mode={mode} />

        {mode === 'edit' && workData && (
          <ImagesSection />
        )}

        {aiResult && <WorkAiResultsSection result={aiResult} />}

        {mode === 'edit' && <WorkNumberValuesSection />}

        {mode === 'edit' && (
          <WorkPersonRolesSection
            recommendedWriters={recommendedWriters}
            recommendedArtists={recommendedArtists}
            recommendedInkers={recommendedInkers}
            mode={mode}
          />
        )}

        {mode === 'edit' && (
          <WorkTagsSection
            recommendedGeneralTags={recommendedGeneralTags}
            recommendedCharacters={recommendedCharacters}
            mode={mode}
          />
        )}

        <WorkSaveBar mode={mode} />
      </form>
    </>
  )
}

function ImagesSection() {
  const {
    workData,
    images,
    selectedImageIds,
    isSettingCover,
    isAnalyzing,
    handlers,
  } = useWorkForm()

  const contentStatus = workData?.contentStatus
  const hasImages = images.length > 0
  const showImages = contentStatus === 2 && hasImages

  if (!showImages || !workData) return null

  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nepsBorder/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center font-bold text-sm border border-nepsPrimary/20">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Páginas Extraídas</h2>
            <p className="text-[11px] text-nepsMuted">
              Seleccioná la portada oficial y las imágenes para el análisis asistido con IA.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium">
            IA Selected:{' '}
            <strong className="text-nepsAi font-mono font-bold text-sm">
              {selectedImageIds.length}
            </strong>{' '}
            págs.
          </span>
          <button
            type="button"
            onClick={handlers.handleAnalyzeWithAi}
            disabled={isAnalyzing || selectedImageIds.length === 0}
            className="px-4 py-2 bg-nepsAi hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{isAnalyzing ? 'Analizando...' : 'Procesar con IA'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-1">
        {images.map((image) => {
          const isCover = workData.coverId === image.id
          const isSelectedForAi = selectedImageIds.includes(image.id)
          return (
            <div
              key={image.id}
              className={cn(
                'relative group rounded-xl overflow-hidden border-2 transition-all',
                isSelectedForAi
                  ? 'border-amber-400 ring-2 ring-amber-400/30'
                  : 'border-nepsBorder hover:border-nepsPrimary/50',
              )}
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-900">
                <ProtectedImage
                  src={image.url}
                  alt={`Página ${image.pageNumber}`}
                  className="w-full h-full object-cover"
                />

                {isCover && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-1 rounded shadow">
                    PORTADA
                  </span>
                )}

                <label className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 backdrop-blur-md p-1.5 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={isSelectedForAi}
                    onChange={() => handlers.toggleImageForAi(image.id)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                </label>
              </div>

              <div className="pt-2.5 flex flex-col gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handlers.handleSetCover(image.id)}
                  disabled={isSettingCover === image.id}
                  className={cn(
                    'w-full py-1.5 rounded-lg font-bold transition-all text-[11px]',
                    isCover
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-nepsCard hover:bg-nepsBorder text-slate-300 border border-nepsBorder hover:border-nepsPrimary/30',
                  )}
                >
                  {isSettingCover === image.id ? (
                    <span className="flex items-center justify-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : isCover ? (
                    '✓ Portada Seleccionada'
                  ) : (
                    'Marcar Portada'
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
