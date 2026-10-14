import type { RecommendedSortField } from '../types/works'

interface RecommendedSortControlsProps {
  value: RecommendedSortField
  onChange: (sortBy: RecommendedSortField) => void
}

interface RecommendedSortOption {
  value: RecommendedSortField
  label: string
}

const SORT_OPTIONS: RecommendedSortOption[] = [
  { value: 'MostPopular', label: 'Más populares' },
  { value: 'RecentlyAdded', label: 'Agregados recientemente' },
  { value: 'MostRated', label: 'Más votados' },
]

/**
 * Ordering selector of the recommended works. Each option is the `sortBy` value the
 * backend expects, so what is selected is exactly what is queried.
 */
export function RecommendedSortControls({ value, onChange }: RecommendedSortControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-[#131a26] border border-[#2d2c33] rounded-xl px-3 py-1.5">
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:inline">Ordenar:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as RecommendedSortField)}
        className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#131a26] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
