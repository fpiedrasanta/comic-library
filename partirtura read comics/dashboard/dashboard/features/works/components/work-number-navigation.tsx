import { useWorkForm } from '@/features/works/contexts/work-form-context'
import WorkSearchSelect from '@/features/works/components/work-search-select'

export default function WorkNumberNavigation() {
  const {
    workData,
    previousNumberId,
    setPreviousNumberId,
    nextNumberId,
    setNextNumberId,
  } = useWorkForm()

  const seriesId = workData?.seriesId ?? undefined

  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-4">
      <h3 className="text-xs font-bold text-nepsMuted uppercase tracking-wider">
        Continuidad
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WorkSearchSelect
          label="Obra Anterior"
          value={previousNumberId ?? undefined}
          onChange={setPreviousNumberId}
          seriesId={seriesId}
          defaultName={previousNumberId ? workData?.previousNumber?.title ?? null : null}
        />
        <WorkSearchSelect
          label="Obra Siguiente"
          value={nextNumberId ?? undefined}
          onChange={setNextNumberId}
          seriesId={seriesId}
          defaultName={nextNumberId ? workData?.nextNumber?.title ?? null : null}
        />
      </div>

      <p className="text-[10px] text-nepsMuted">
        Ambos son opcionales. Podés seleccionar solo uno, ambos, o ninguno.
      </p>
    </div>
  )
}
