import type { WorkSortField, WorkSortDirection } from '../types/works'

interface SortControlsProps {
  sortField: WorkSortField
  sortDirection: WorkSortDirection
  onFieldChange: (field: WorkSortField) => void
  onDirectionToggle: () => void
}

export function SortControls({ sortField, sortDirection, onFieldChange, onDirectionToggle }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-[#131a26] border border-[#2d2c33] rounded-xl px-3 py-1.5">
      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Ordenar por:</span>
      <select
        value={sortField}
        onChange={(e) => onFieldChange(e.target.value as WorkSortField)}
        className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium"
      >
        <option value="CreatedAt" className="bg-[#131a26] text-white">Fecha de subida</option>
        <option value="PublicationDate" className="bg-[#131a26] text-white">Fecha de publicación</option>
        <option value="Title" className="bg-[#131a26] text-white">Título</option>
        <option value="Number" className="bg-[#131a26] text-white">Número</option>
      </select>
      <button
        type="button"
        onClick={onDirectionToggle}
        title="Cambiar dirección"
        className="p-1 hover:bg-[#0d121d] rounded text-sky-400 transition-colors"
      >
        <svg
          className="w-3.5 h-3.5"
          style={{ transform: sortDirection === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  )
}
