import type { ReadingHistoryState } from '../types/works'

interface ReadingStateFilterProps {
  value: ReadingHistoryState
  onChange: (state: ReadingHistoryState) => void
}

interface ReadingStateOption {
  value: ReadingHistoryState
  label: string
}

const STATE_OPTIONS: ReadingStateOption[] = [
  { value: 'reading', label: 'Leyendo' },
  { value: 'completed', label: 'Leídas' },
]

/**
 * Leyendo / Leídas switch of Mi colección.
 * The option is the history state sent to the backend, so what is shown and what
 * is queried are the same value.
 */
export function ReadingStateFilter({ value, onChange }: ReadingStateFilterProps) {
  return (
    <div className="flex items-center gap-2 bg-[#131a26] border border-[#2d2c33] rounded-xl px-3 py-1.5">
      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Estado:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ReadingHistoryState)}
        className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium"
      >
        {STATE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#131a26] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
