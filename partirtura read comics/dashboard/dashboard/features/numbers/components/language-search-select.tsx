import { useState, useEffect, useRef } from 'react'
import { getLanguages } from '@/features/languages/services/language.service'
import type { Language } from '@/types/languages'
import { cn } from '@/lib/utils'

interface LanguageSearchSelectProps {
  label: string
  value?: number
  onChange: (value: number | undefined) => void
  onSelectedNameChange?: (name: string | null) => void
  defaultName?: string | null
}

export default function LanguageSearchSelect({
  label,
  value,
  onChange,
  onSelectedNameChange,
  defaultName,
}: LanguageSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [items, setItems] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInternalChangeRef = useRef(false)

  const [allItems, setAllItems] = useState<Language[]>([])

  useEffect(() => {
    if (!allItems || allItems.length === 0) {
      loadLanguages()
    }
  }, [])

  useEffect(() => {
    if (!value) {
      setSelectedName(null)
      onSelectedNameChange?.(null)
      return
    }

    const found = allItems.find((l) => l.id === value)
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
  }, [value, allItems, defaultName, onSelectedNameChange])

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

  async function loadLanguages() {
    setIsLoading(true)
    try {
      const result = await getLanguages()
      setAllItems(result)
      setItems(result)
      setHighlightedIndex(-1)
    } catch {
      setAllItems([])
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

    if (!allItems || allItems.length === 0) {
      loadLanguages()
      return
    }

    setItems(
      allItems.filter((lang) =>
        lang.name.toLowerCase().includes(newValue.toLowerCase()),
      ),
    )
    setHighlightedIndex(-1)
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (!allItems || allItems.length === 0) {
      loadLanguages()
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
            (language) => language.name === inputValue,
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
      const maxIndex = (items?.length ?? 1) - 1
      setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && (items?.length ?? 0) > 0 && highlightedIndex < items.length) {
        const selected = items[highlightedIndex]
        if (selected) handleSelect(selected)
      }
    }
  }

  const handleSelect = (language: Language) => {
    isInternalChangeRef.current = true
    onChange(language.id)
    setSelectedName(language.name)
    onSelectedNameChange?.(language.name)
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
          placeholder="Buscar idioma..."
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
          id="language-listbox"
          role="listbox"
          className="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-nepsCard border border-nepsBorder rounded-xl shadow-lg"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              Buscando...
            </div>
          ) : (items?.length === 0 || items === undefined) ? (
            <div className="px-3 py-2 text-xs text-nepsMuted">
              No se encontraron idiomas
            </div>
          ) : (
            items.map((language, index) => (
              <div
                key={language.id}
                role="option"
                aria-selected={index === highlightedIndex || language.id === value}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(language)
                }}
                className={cn(
                  'px-3 py-2 text-xs cursor-pointer transition-colors',
                  'hover:bg-nepsInput text-slate-300',
                  (index === highlightedIndex || language.id === value) &&
                    'bg-nepsPrimary/10 text-nepsPrimary',
                )}
              >
                {language.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
