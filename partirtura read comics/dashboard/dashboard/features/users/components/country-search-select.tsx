import { useState, useEffect, useRef } from 'react'
import { getCountries } from '../services/country.service'
import type { Country } from '@/types/country'
import { cn } from '@/lib/utils'

const COUNTRY_SEARCH_PAGE_SIZE = 10

interface CountrySearchSelectProps {
  label: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  initialSelectedName?: string
  onSelectionChange?: (name: string | null) => void
}

export default function CountrySearchSelect({
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  initialSelectedName,
  onSelectionChange,
}: CountrySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [items, setItems] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInternalChangeRef = useRef(false)

  useEffect(() => {
    if (!value) {
      setSelectedName(null)
      return
    }

    const found = items.find((c) => String(c.id) === value)
    if (found) {
      setSelectedName(found.name)
      if (!isInternalChangeRef.current) {
        setInputValue('')
      }
      isInternalChangeRef.current = false
    } else if (initialSelectedName) {
      setSelectedName(initialSelectedName)
      if (!isInternalChangeRef.current) {
        setInputValue('')
      }
      isInternalChangeRef.current = false
    }
  }, [value, items, initialSelectedName])

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  async function searchCountries(term: string) {
    setIsLoading(true)
    try {
      const result = await getCountries({
        currentPage: 1,
        pageSize: COUNTRY_SEARCH_PAGE_SIZE,
        search: term,
        isActive: true,
      })
      setItems(result.items)
      setHighlightedIndex(-1)
    } catch {
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setSelectedName(null)
    isInternalChangeRef.current = true
    onChange('')
    setIsOpen(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchCountries(newValue)
    }, 300)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (items.length === 0) {
      searchCountries('')
    }
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
          const exactMatch = items.find(
            (country) => country.name === inputValue,
          )
          if (exactMatch) {
            handleSelect(exactMatch)
          } else {
            setInputValue('')
            setSelectedName(null)
            onChange('')
            onSelectionChange?.(null)
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
      setHighlightedIndex((prev) => Math.min(prev + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        const selected = items[highlightedIndex]
        if (selected) handleSelect(selected)
      }
    }
  }

  const handleSelect = (country: Country) => {
    isInternalChangeRef.current = true
    onChange(String(country.id))
    setSelectedName(country.name)
    onSelectionChange?.(country.name)
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const displayValue = inputValue || selectedName || ''

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold text-white mb-1.5">
        {label}
      </label>

      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu país"
        disabled={disabled}
        className={cn(
          'w-full bg-nepsInput border border-nepsBorder rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all',
          'text-white placeholder-slate-500',
          'focus:border-nepsPrimary focus:ring-1 focus:ring-nepsPrimary',
          error && 'border-nepsAccent focus:border-nepsAccent focus:ring-nepsAccent',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-owns={isOpen ? 'country-listbox' : undefined}
        aria-invalid={!!error}
        aria-autocomplete="list"
        autoComplete="off"
      />

      {isOpen && (
        <div
          id="country-listbox"
          role="listbox"
          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-nepsCard border border-nepsBorder rounded-xl shadow-lg"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              Buscando...
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              No se encontraron países
            </div>
          ) : (
            items.map((country, index) => (
              <div
                key={country.id}
                role="option"
                aria-selected={
                  index === highlightedIndex || String(country.id) === value
                }
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(country)
                }}
                className={cn(
                  'px-3 py-2 text-xs cursor-pointer transition-colors',
                  'hover:bg-nepsInput text-slate-300',
                  (index === highlightedIndex ||
                    String(country.id) === value) &&
                    'bg-nepsPrimary/10 text-nepsPrimary',
                )}
              >
                {country.name}
              </div>
            ))
          )}
        </div>
      )}

      {error && <p className="text-nepsAccent text-[10px] mt-1">{error}</p>}
    </div>
  )
}
