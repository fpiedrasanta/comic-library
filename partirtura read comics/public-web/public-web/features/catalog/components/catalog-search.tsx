import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from '../hooks/use-debounced-callback'

const SEARCH_DEBOUNCE_MS = 350

interface CatalogSearchProps {
  value: string
  onChange: (value: string) => void
  /** Defaults to the works search; each listing names what it searches. */
  placeholder?: string
}

export function CatalogSearch({ value, onChange, placeholder = 'Buscar por título, resumen, número, tags o autor...' }: CatalogSearchProps) {
  const [inputValue, setInputValue] = useState(value)
  const committedRef = useRef(value)

  const commit = (next: string) => {
    committedRef.current = next
    onChange(next)
  }

  const { schedule: commitDebounced, cancel: cancelPendingCommit } = useDebouncedCallback(commit, SEARCH_DEBOUNCE_MS)

  // The committed value can change from outside the input, through browser
  // navigation or the clear button, so the local text has to follow it.
  useEffect(() => {
    if (value === committedRef.current) return
    committedRef.current = value
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    commitDebounced(next)
  }

  const handleClear = () => {
    cancelPendingCommit()
    setInputValue('')
    commit('')
  }

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full bg-[#0d121d] border border-[#2d2c33] focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 text-xs outline-none transition-all"
      />
      <svg
        className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
        >
          ✕
        </button>
      )}
    </div>
  )
}
