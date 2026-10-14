import { useWorkForm } from '@/features/works/contexts/work-form-context'
import WorkTypeSearchSelect from '@/features/works/components/work-type-search-select'
import LanguageSearchSelect from '@/features/numbers/components/language-search-select'
import WorkSearchSelect from '@/features/works/components/work-search-select'

export default function WorkNumberValuesSection() {
  const {
    form,
    workData,
    languageId,
    setLanguageId,
    languageName,
    setLanguageName,
    workTypeId,
    setWorkTypeId,
    workTypeName,
    setWorkTypeName,
    lastAiResult,
    handlers,
    previousNumberId,
    setPreviousNumberId,
    nextNumberId,
    setNextNumberId,
  } = useWorkForm()
  const { register, watch, reset } = form

  const publisherId = workData?.publisherId ?? undefined
  const franchiseId = workData?.franchiseId ?? undefined
  const seriesId = workData?.seriesId ?? undefined

  const aiNumber = lastAiResult?.number ?? null
  const aiTitle = lastAiResult?.title ?? null
  const aiSummary = lastAiResult?.summary ?? null
  const aiDescription = lastAiResult?.description ?? null
  const aiPublicationDate = lastAiResult?.publicationDate ?? null

  const combinedDescription = [aiSummary, aiDescription].filter(Boolean).join('<br/>') || null

  const renderAiDetection = (label: string, value: string | null, onClick: () => void) => {
    const display = value ?? 'N/A'
    return (
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[10px] text-nepsMuted font-bold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] text-slate-200">{display}</span>
        <button
          type="button"
          onClick={onClick}
          title="Copiar al campo"
          className="text-nepsMuted hover:text-nepsAi transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-3 border-b border-nepsBorder/60 pb-4">
          <div className="w-8 h-8 rounded-lg bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center font-bold text-sm border border-nepsPrimary/20">
            3
          </div>
          <h2 className="text-sm font-bold text-white">Datos del Número (Edición Editorial)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="numberValue" className="text-xs font-semibold text-white block">
              Número
            </label>
            <input
              type="text"
              id="numberValue"
              {...register('numberValue')}
              placeholder="Ej. 1, 10A, Annual 1"
              maxLength={100}
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {renderAiDetection('Número detectado', aiNumber, () => handlers.handleApplyNumberValue(aiNumber))}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-white block">
              Título del Ejemplar <span className="text-nepsAccent">*</span>
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              placeholder="Ej. El Sueño del Dios de la Destrucción"
              maxLength={500}
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {renderAiDetection('Título detectado', aiTitle, () => handlers.handleApplyTitle(aiTitle))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-semibold text-white block">
            Sinopsis / Descripción Editorial
          </label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Sinopsis del número..."
            rows={4}
            maxLength={5000}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors resize-none"
          />
          <div className="space-y-1">
            {combinedDescription && (
              <div className="flex items-start gap-2 text-[10px]">
                <span className="text-nepsMuted">DESCRIPCIÓN:</span>
                <span
                  className="flex-1 text-nepsAi/90"
                  dangerouslySetInnerHTML={{ __html: combinedDescription }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const combined = [aiSummary, aiDescription].filter(Boolean).join('\n')
                    if (combined) {
                      reset({ ...watch(), description: combined })
                    }
                  }}
                  title="Copiar al campo"
                  className="text-nepsMuted hover:text-nepsAi transition-colors flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">Idioma</label>
            <LanguageSearchSelect
              label=""
              value={languageId}
              onChange={(id) => {
                setLanguageId(id)
                setLanguageName(id ? (languageName ?? '') : null)
              }}
              onSelectedNameChange={setLanguageName}
              defaultName={workData?.languageName ?? null}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">
              Tipo <span className="text-nepsAccent">*</span>
            </label>
            <WorkTypeSearchSelect
              label=""
              value={workTypeId}
              onChange={(id) => {
                setWorkTypeId(id)
                setWorkTypeName(id ? (workTypeName ?? '') : null)
              }}
              onSelectedNameChange={setWorkTypeName}
              hideLabel
              defaultName={workData?.workTypeName ?? null}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="publicationDate" className="text-xs font-semibold text-white block">
              Fecha de publicación
            </label>
            <input
              type="date"
              id="publicationDate"
              {...register('publicationDate')}
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {renderAiDetection('Fecha detectada', aiPublicationDate, () => handlers.handleApplyPublicationDate(aiPublicationDate))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">Número Anterior (Secuencia)</label>
            <WorkSearchSelect
              label=""
              value={previousNumberId}
              onChange={(id) => setPreviousNumberId(id)}
              seriesId={seriesId}
              publisherId={publisherId}
              franchiseId={franchiseId}
              placeholder="Buscar número anterior..."
              defaultName={previousNumberId ? workData?.previousNumber?.title ?? null : null}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white block">Número Siguiente (Secuencia)</label>
            <WorkSearchSelect
              label=""
              value={nextNumberId}
              onChange={(id) => setNextNumberId(id)}
              seriesId={seriesId}
              publisherId={publisherId}
              franchiseId={franchiseId}
              placeholder="Buscar número siguiente..."
              defaultName={nextNumberId ? workData?.nextNumber?.title ?? null : null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
