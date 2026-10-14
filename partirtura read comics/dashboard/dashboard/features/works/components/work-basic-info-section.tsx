import { useWorkForm } from '@/features/works/contexts/work-form-context'

interface WorkBasicInfoSectionProps {
  mode: 'create' | 'edit'
}

export default function WorkBasicInfoSection({ mode }: WorkBasicInfoSectionProps) {
  const { form } = useWorkForm()
  const { register } = form
  const errors = form.formState.errors as Record<string, { message?: string }>

  return (
    <div className="space-y-4">
      {mode === 'create' && (
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-semibold text-white block">
            Nombre / Referencia Inicial <span className="text-nepsAccent">*</span>
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            placeholder="Ej. Dragon Ball Super #01 - El Guerrero del Futuro"
            maxLength={500}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
          />
          {errors.title && (
            <p className="text-[11px] text-nepsAccent">{errors.title.message}</p>
          )}
          <p className="text-[10px] text-nepsMuted">
            Nombre de referencia preliminar para identificar el registro antes de procesar los metadatos
            finales.
          </p>
        </div>
      )}
    </div>
  )
}
