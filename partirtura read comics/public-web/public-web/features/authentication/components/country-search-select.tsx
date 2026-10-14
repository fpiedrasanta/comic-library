import { useState, useEffect, useRef } from 'react'
import { countryRepository } from '@/features/authentication/api/country-repository'
import type { CountryDto } from '@/types/api'
import { cn } from '@/lib/utils'

interface CountrySearchSelectProps {
  label: string
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
}

export default function CountrySearchSelect({
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: CountrySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [items, setItems] = useState<CountryDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (value && items.length === 0) {
      searchCountries('')
    }
  }, [value, items.length])

  useEffect(() => {
    if (value) {
      const found = items.find((c) => String(c.id) === value)
      if (found) setSelectedName(found.name)
    } else {
      setSelectedName(null)
    }
  }, [value, items])

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
      const result = await countryRepository.getPaged({
        currentPage: 1,
        pageSize: 12,
        search: term,
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
    setInputValue(e.target.value)
    setSelectedName(null)
    onChange('')
    setIsOpen(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchCountries(e.target.value)
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

  const handleSelect = (country: CountryDto) => {
    onChange(String(country.id))
    setSelectedName(country.name)
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const displayValue = inputValue || selectedName || ''

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-neps-muted mb-1">
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
          'w-full bg-neps-input border border-neps-border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm',
          'text-neps-text placeholder-slate-600 outline-none transition-all duration-200',
          'focus:border-neps-primary focus:ring-1 focus:ring-neps-primary',
          'autofill:bg-neps-input autofill:text-neps-text autofill:shadow-[0_0_0_inset_1000px_#0d121d]',
          error && 'border-neps-accent focus:border-neps-accent focus:ring-neps-accent',
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
          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-neps-card border border-neps-border rounded-lg shadow-lg"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-neps-muted">
              Buscando...
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-neps-muted">
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
                  'px-3 py-2 text-xs sm:text-sm cursor-pointer transition-colors',
                  'hover:bg-neps-input text-neps-text',
                  (index === highlightedIndex ||
                    String(country.id) === value) &&
                    'bg-neps-primary/10 text-neps-primary',
                )}
              >
                {country.name}
              </div>
            ))
          )}
        </div>
      )}

      {error && <p className="text-neps-accent text-[10px] mt-1">{error}</p>}
    </div>
  )
}
