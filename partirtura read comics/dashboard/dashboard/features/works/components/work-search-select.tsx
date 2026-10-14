import { useState, useEffect, useRef } from 'react'
import { getWorks } from '@/features/works/services/works.service'
import type { WorkListItemDto } from '@/types/works'
import { cn } from '@/lib/utils'

const SEARCH_PAGE_SIZE = 10

interface WorkSearchSelectProps {
  label: string
  value?: number
  onChange: (value: number | undefined) => void
  onSelectedNameChange?: (name: string | null) => void
  seriesId?: number
  publisherId?: number
  franchiseId?: number
  placeholder?: string
  defaultName?: string | null
}

export default function WorkSearchSelect({
  label,
  value,
  onChange,
  onSelectedNameChange,
  seriesId,
  publisherId,
  franchiseId,
  placeholder = 'Buscar obra...',
  defaultName,
}: WorkSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [items, setItems] = useState<WorkListItemDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const placeholderText = placeholder ?? 'Buscar obra...'

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInternalChangeRef = useRef(false)

  useEffect(() => {
    if (!value) {
      setSelectedName(null)
      onSelectedNameChange?.(null)
      return
    }

    const found = items.find((w) => w.id === value)
    if (found) {
      const displayName =
        (found.numberValue ? `${found.numberValue} - ` : '') + (found.title || '')
      setSelectedName(displayName.trim() || found.title || found.numberValue || 'N/A')
      onSelectedNameChange?.(displayName.trim() || found.title || found.numberValue || 'N/A')
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
    if ((seriesId || publisherId || franchiseId) && items.length === 0) {
      searchWorks('')
    }
  }, [seriesId, publisherId, franchiseId])

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

  async function searchWorks(term: string) {
    // Determine parent ID based on cascading hierarchy: series > franchise > publisher
    const parentId = seriesId
      ? { seriesId }
      : franchiseId
        ? { franchiseId }
        : publisherId
          ? { publisherId }
          : null

    if (!parentId) {
      setItems([])
      return
    }

    setIsLoading(true)
    try {
      const result = await getWorks({
        currentPage: 1,
        pageSize: SEARCH_PAGE_SIZE,
        search: term,
        orderBy: 'number',
        orderDir: 'desc',
        ...parentId,
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
    onSelectedNameChange?.(null)
    isInternalChangeRef.current = true
    onChange(undefined)
    setIsOpen(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchWorks(newValue)
    }, 300)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (items.length === 0 && (seriesId || publisherId || franchiseId)) {
      searchWorks('')
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
            (w) => w.title === inputValue || w.numberValue === inputValue,
          )
          if (exactMatch) {
            handleSelect(exactMatch)
          } else {
            setInputValue('')
            setSelectedName(null)
            onSelectedNameChange?.(null)
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

  const handleSelect = (work: WorkListItemDto) => {
    isInternalChangeRef.current = true
    onChange(work.id)
    const displayName =
      (work.numberValue ? `${work.numberValue} - ` : '') + (work.title || '')
    const display = displayName.trim() || work.title || work.numberValue || 'N/A'
    setSelectedName(display)
    onSelectedNameChange?.(display)
    setInputValue('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleClear = () => {
    onChange(undefined)
    setSelectedName(null)
    onSelectedNameChange?.(null)
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
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={cn(
            'w-full bg-nepsInput border border-nepsBorder rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all',
            'text-white placeholder-slate-500',
            'focus:border-nepsPrimary',
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
          id="work-listbox"
          role="listbox"
          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-nepsCard border border-nepsBorder rounded-xl shadow-lg"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              Buscando...
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              No se encontraron obras
            </div>
          ) : (
items.map((work, index) => (
                <div
                  key={work.id}
                  role="option"
                  aria-selected={work.id === value || index === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(work)
                  }}
                  className={cn(
                    'px-3 py-2 text-xs cursor-pointer transition-colors',
                    'hover:bg-nepsInput text-slate-300',
                    (work.id === value || index === highlightedIndex) &&
                      'bg-nepsPrimary/10 text-nepsPrimary',
                  )}
                >
                  {work.numberValue && work.title
                    ? `${work.numberValue} - ${work.title}`
                    : work.numberValue || work.title || 'N/A'}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}
