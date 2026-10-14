import { useState, useEffect, useRef } from 'react'
import { useDebouncedCallback } from '../hooks/use-debounced-callback'
import type { EntityOption } from '../types/works'

const AUTOCOMPLETE_DEBOUNCE_MS = 300

interface EntityAutocompleteProps {
  label: string
  placeholder: string
  value: EntityOption | null
  options: EntityOption[]
  onSelect: (option: EntityOption | null) => void
  onClear?: () => void
  onSearch?: (term: string) => void
  onFocus?: () => void
  onBlur?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function EntityAutocomplete({
  label,
  placeholder,
  value,
  options,
  onSelect,
  onClear,
  onSearch,
  onFocus,
  onBlur,
  isLoading = false,
  disabled = false,
}: EntityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { schedule: debouncedSearch, cancel: cancelPendingSearch } = useDebouncedCallback(
    (term: string) => onSearch?.(term),
    AUTOCOMPLETE_DEBOUNCE_MS,
  )

  useEffect(() => {
    if (!value) {
      setSelectedName(null)
      return
    }
    const found = options.find((option) => option.id === value.id)
    if (found) {
      setSelectedName(found.name)
    } else if (value.name) {
      setSelectedName(value.name)
    }
  }, [value, options])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = (term: string) => {
    onSearch?.(term)
  }

  const handleSelect = (option: EntityOption) => {
    cancelPendingSearch()
    onSelect(option)
    setSelectedName(option.name)
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleClearValue = () => {
    cancelPendingSearch()
    onClear?.()
    setInputValue('')
    setSelectedName(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setInputValue(term)
    setSelectedName(null)
    onSelect(null)
    setIsOpen(true)
    debouncedSearch(term)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (options.length === 0 && onSearch) {
      search('')
    }
    onFocus?.()
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (
        containerRef.current &&
        !containerRef.current.contains(document.activeElement)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)

        if (inputValue) {
          const exactMatch = options.find((option) => option.name === inputValue)
          if (exactMatch) {
            handleSelect(exactMatch)
          } else {
            setInputValue('')
            setSelectedName(null)
            onSelect(null)
          }
        }
      }

      onBlur?.()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        const selected = options[highlightedIndex]
        if (selected) {
          handleSelect(selected)
        }
      }
    }
  }

  const displayValue = inputValue || selectedName || ''

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>{label}</span>
        {value && onClear && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              handleClearValue()
            }}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            title="Limpiar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>
        )}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[#0d121d] border border-[#2d2c33] text-xs text-white rounded-lg px-3 py-2 outline-none transition-colors focus:border-sky-400"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isOpen && options.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1 bg-[#131a26] border border-[#2d2c33] rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto"
            role="listbox"
          >
            {options.map((option, index) => (
              <div
                key={option.id}
                role="option"
                aria-selected={index === highlightedIndex || option.id === value?.id}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(option)
                }}
                className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                  index === highlightedIndex || option.id === value?.id
                    ? 'bg-sky-400/10 text-sky-400'
                    : 'text-white hover:bg-[#0d121d]'
                }`}
              >
                <p className="font-bold">{option.name}</p>
                {option.context && <p className="text-[10px] text-slate-400">{option.context}</p>}
                {option.secondaryContext && <p className="text-[10px] text-slate-400">{option.secondaryContext}</p>}
              </div>
            ))}
          </div>
        )}
        {isOpen && options.length === 0 && !isLoading && inputValue.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[#131a26] border border-[#2d2c33] rounded-xl shadow-2xl z-40 p-3">
            <p className="text-xs text-slate-400">Sin resultados</p>
          </div>
        )}
      </div>
    </div>
  )
}
