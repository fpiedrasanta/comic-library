import { useState, useEffect, useRef } from 'react'
import { getListTypes } from '@/features/list-types/services/list-type.service'
import type { ListType } from '@/features/list-types/types/list-type'
import { cn } from '@/lib/utils'

const SEARCH_PAGE_SIZE = 10

interface ListTypeSearchSelectProps {
  label: string
  value?: number
  onChange: (value: number | undefined) => void
  disabled?: boolean
  placeholder?: string
  allLabel?: string
  defaultName?: string | null
  onSelectedNameChange?: (name: string | null) => void
}

export default function ListTypeSearchSelect({
  label,
  value,
  onChange,
  disabled,
  placeholder = 'Buscar tipo de lista...',
  allLabel = 'Todos los tipos',
  defaultName,
  onSelectedNameChange,
}: ListTypeSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [items, setItems] = useState<ListType[]>([])
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
      onSelectedNameChange?.(null)
      return
    }

    const found = items.find((lt) => lt.id === value)
    if (found) {
      setSelectedName(found.name)
      onSelectedNameChange?.(found.name)
      if (!isInternalChangeRef.current) {
        setInputValue('')
      }
      isInternalChangeRef.current = false
    } else if (defaultName) {
      setSelectedName(defaultName)
      onSelectedNameChange?.(defaultName)
      if (!isInternalChangeRef.current) {
        setInputValue('')
      }
      isInternalChangeRef.current = false
    }
  }, [value, items, defaultName, onSelectedNameChange])

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

  async function searchListTypes(term: string) {
    setIsLoading(true)
    try {
      const result = await getListTypes({
        currentPage: 1,
        pageSize: SEARCH_PAGE_SIZE,
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
    onChange(undefined)
    setIsOpen(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchListTypes(newValue)
    }, 300)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (items.length === 0) {
      searchListTypes('')
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
            (lt) => lt.name === inputValue,
          )
          if (exactMatch) {
            handleSelect(exactMatch)
          } else {
            setInputValue('')
            setSelectedName(null)
            onChange(undefined)
          }
        }
      }
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

  const handleSelect = (listType: ListType) => {
    isInternalChangeRef.current = true
    onChange(listType.id)
    setSelectedName(listType.name)
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleSelectAll = () => {
    isInternalChangeRef.current = true
    onChange(undefined)
    setSelectedName(null)
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleClear = () => {
    onChange(undefined)
    setSelectedName(null)
    setInputValue('')
  }

  const displayValue = inputValue || selectedName || ''

  return (
    <div className="relative" ref={containerRef}>
      <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block mb-1">
        {label}
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
          className={cn(
            'w-full bg-nepsInput border border-nepsBorder rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all',
            'text-white placeholder-slate-500',
            'focus:border-nepsPrimary',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoComplete="off"
        />
        {selectedName && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-nepsMuted hover:text-white p-0.5"
            title="Limpiar selección"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id="list-type-listbox"
          role="listbox"
          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-nepsCard border border-nepsBorder rounded-xl shadow-lg"
        >
          <div
            key="__all__"
            role="option"
            aria-selected={!selectedName && !value}
            onMouseDown={(e) => {
              e.preventDefault()
              handleSelectAll()
            }}
            className={cn(
              'px-3 py-2 text-xs cursor-pointer transition-colors',
              'hover:bg-nepsInput text-slate-300',
              (!selectedName && !value) && 'bg-nepsPrimary/10 text-nepsPrimary',
            )}
          >
            {allLabel}
          </div>
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              Buscando...
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              No se encontraron tipos de lista
            </div>
          ) : (
            items.map((listType, index) => (
              <div
                key={listType.id}
                role="option"
                aria-selected={listType.id === value || index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(listType)
                }}
                className={cn(
                  'px-3 py-2 text-xs cursor-pointer transition-colors',
                  'hover:bg-nepsInput text-slate-300',
                  (listType.id === value || index === highlightedIndex) &&
                    'bg-nepsPrimary/10 text-nepsPrimary',
                )}
              >
                {listType.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
