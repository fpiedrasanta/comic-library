import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import type { WorkListFormData } from '../pages/work-list-form-page'
import { ProtectedImage } from '@/components/protected-image'
import ListTypeSearchSelect from '@/features/list-types/components/list-type-search-select'

interface WorkListInfoSectionProps {
  control: Control<WorkListFormData>
  errors: FieldErrors<WorkListFormData>
  coverPreview: string | null
  coverFile: File | null
  coverError: string | null
  presetColors: readonly string[]
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearCover: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  listTypeName?: string | null
}

export default function WorkListInfoSection({
  control,
  errors,
  coverPreview,
  coverFile,
  coverError,
  presetColors,
  onCoverChange,
  onClearCover,
  fileInputRef,
  listTypeName,
}: WorkListInfoSectionProps) {
  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-nepsBorder/60 pb-3">
        <h3 className="text-xs font-bold text-nepsMuted uppercase tracking-wider">1. Información de la Lista</h3>
        <span className="text-[10px] text-nepsMuted">* Campos obligatorios</span>
      </div>

      <div className="space-y-1.5">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <>
              <label htmlFor="work-list-name-input" className="text-xs font-semibold text-white block">
                Nombre de la Lista <span className="text-nepsAccent">*</span>
              </label>
              <input
                id="work-list-name-input"
                type="text"
                {...field}
                placeholder="Ej: Lecturas recomendadas de verano"
                className={`w-full bg-nepsInput border rounded-xl px-3.5 py-2.5 outline-none transition-colors text-xs text-white placeholder-slate-500 ${
                  errors.name
                    ? 'border-nepsAccent focus:border-nepsAccent'
                    : 'border-nepsBorder focus:border-nepsPrimary'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-nepsAccent mt-1">{errors.name.message}</p>
              )}
            </>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="work-list-description" className="text-xs font-semibold text-white block">
          Descripción / Sinopsis
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <textarea
              id="work-list-description"
              rows={3}
              {...field}
              placeholder="Ingresá una reseña o contexto sobre esta lista de obras..."
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors resize-none"
            />
          )}
        />
        {errors.description && (
          <p className="text-[11px] text-nepsAccent mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white block">Color Distintivo</label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={field.value || '#38bdf8'}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent p-0"
                />
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-nepsMuted text-xs">#</span>
                  <input
                    type="text"
                    value={(field.value || '').replace('#', '').toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value.replace('#', '').toUpperCase()
                      field.onChange(val.length === 6 ? `#${val}` : val ? `#${val}` : '')
                    }}
                    maxLength={6}
                    className={`w-full bg-nepsInput border rounded-xl pl-7 pr-3 py-2 outline-none text-xs font-mono uppercase ${
                      errors.color
                        ? 'border-nepsAccent focus:border-nepsAccent text-white'
                        : 'border-nepsBorder focus:border-nepsPrimary text-white'
                    }`}
                  />
                </div>
              </div>
              {errors.color && <p className="text-[11px] text-nepsAccent mt-1">{errors.color.message}</p>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => field.onChange(color)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      (field.value || '') === color
                        ? 'border-white ring-2 ring-nepsPrimary ring-offset-2 ring-offset-nepsCard'
                        : 'border-nepsBorder hover:border-nepsMuted'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white block">
          Portada / Image Cover<span className="text-nepsAccent">*</span>
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-nepsInput border border-nepsBorder rounded-2xl p-3.5">
          <div className="relative w-20 h-28 rounded-xl bg-nepsCard border border-nepsBorder overflow-hidden flex-shrink-0 flex items-center justify-center">
            {coverPreview ? (
              <ProtectedImage src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-nepsMuted text-[10px] text-center p-1">
                <svg
                  className="w-6 h-6 mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Sin portada
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div
              className="relative border-2 border-dashed border-nepsBorder hover:border-nepsPrimary/50 rounded-xl p-4 text-center cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={onCoverChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <svg
                  className="w-6 h-6 text-nepsMuted group-hover:text-nepsPrimary transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-xs font-semibold text-white">
                  <span className="text-nepsPrimary">Hacé clic para subir</span> o arrastrá un archivo
                </p>
                <p className="text-[10px] text-nepsMuted">PNG, JPG, WEBP hasta 5MB</p>
              </div>
            </div>
            {coverFile && (
              <div className="flex items-center justify-between text-[11px] bg-nepsCard px-3 py-1.5 rounded-lg border border-nepsBorder">
                <span className="text-slate-200 font-mono truncate">{coverFile.name}</span>
                <button
                  type="button"
                  onClick={onClearCover}
                  className="text-nepsAccent hover:underline text-[10px] font-bold"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        </div>
        {coverError && <p className="text-[11px] text-nepsAccent mt-1">{coverError}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-nepsBorder/60">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white block">
            Tipo de Lista <span className="text-nepsAccent">*</span>
          </label>
            <Controller
              control={control}
              name="listTypeId"
              render={({ field }) => (
                <ListTypeSearchSelect
                  label=""
                  value={field.value ? Number(field.value) : undefined}
                  onChange={(val) => field.onChange(val)}
                  placeholder="Buscar tipo de lista..."
                  allLabel="Seleccionar tipo..."
                  defaultName={listTypeName ?? null}
                />
              )}
            />
          {errors.listTypeId && (
            <p className="text-[11px] text-nepsAccent mt-1">{errors.listTypeId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white block">
            Visibilidad <span className="text-nepsAccent">*</span>
          </label>
          <Controller
            control={control}
            name="visibility"
             render={({ field }) => (
              <select
                {...field}
                value={field.value != null ? String(field.value) : ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full bg-nepsInput border rounded-xl px-3.5 py-2.5 outline-none transition-colors text-xs text-white ${
                  errors.visibility
                    ? 'border-nepsAccent focus:border-nepsAccent'
                    : 'border-nepsBorder focus:border-nepsPrimary'
                }`}
              >
                <option value="0">Pública (Visible en la app global)</option>
                <option value="1">Privada (Sólo admins)</option>
              </select>
            )}
          />
          {errors.visibility && (
            <p className="text-[11px] text-nepsAccent mt-1">{errors.visibility.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
