import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  label: string
  placeholder?: string
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

export default function TagInput({
  label,
  placeholder = 'Escribe una etiqueta y pulsa Intro...',
  tags,
  onChange,
  maxTags = 50,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (tags.length >= maxTags) {
        return
      }
      const newTag = inputValue.trim()
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault()
      onChange(tags.slice(0, -1))
    } else if (e.key === 'Escape') {
      setInputValue('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedTags = pastedData
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t) && tags.length + 1 <= maxTags)

    if (pastedTags.length > 0) {
      onChange([...tags, ...pastedTags])
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="w-full">
      <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block mb-1">
        {label}
      </label>

      <div
        className={cn(
          'flex min-h-[36px] flex-wrap items-center gap-1.5 px-2.5 py-1.5',
          'bg-nepsInput border border-nepsBorder rounded-lg outline-none',
          'focus-within:border-nepsPrimary transition-colors',
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-nepsPrimary/15 text-nepsPrimary rounded"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:text-white transition-colors"
              title={`Eliminar "${tag}"`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-xs text-white placeholder-slate-500"
          disabled={tags.length >= maxTags}
          aria-label={label}
        />
      </div>

      {tags.length >= maxTags && (
        <p className="text-[10px] text-nepsMuted mt-1">
          Has alcanzado el máximo de {maxTags} etiquetas
        </p>
      )}
    </div>
  )
}
