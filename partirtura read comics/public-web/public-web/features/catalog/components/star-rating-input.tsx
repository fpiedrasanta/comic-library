import { useState } from 'react'

export function StarRatingInput({ 
  value = 0, 
  onChange, 
  maxStars = 5, 
  size = 28, 
  disabled = false,
  allowZero = true
}: {
  value: number
  onChange: (value: number) => void
  maxStars?: number
  size?: number
  disabled?: boolean
  allowZero?: boolean
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value

  const stars = Array.from({ length: maxStars }, (_, i) => i + 1)

  const handleClick = (starValue: number) => {
    if (disabled) return
    if (allowZero && starValue === value) {
      onChange(0)
    } else {
      onChange(starValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (disabled) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        handleClick(starValue)
        break
      case 'ArrowRight':
        e.preventDefault()
        onChange(Math.min(maxStars, value + 1))
        break
      case 'ArrowLeft':
        e.preventDefault()
        onChange(allowZero ? Math.max(0, value - 1) : Math.max(1, value - 1))
        break
      case 'Home':
        e.preventDefault()
        onChange(allowZero ? 0 : 1)
        break
      case 'End':
        e.preventDefault()
        onChange(maxStars)
        break
    }
  }

  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Seleccionar puntuación" aria-disabled={disabled}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`p-1 rounded transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'} ${displayValue >= star ? 'text-amber-400' : 'text-slate-500'}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !disabled && setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          onKeyDown={(e) => handleKeyDown(e, star)}
          disabled={disabled}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          aria-checked={value === star}
          role="radio"
          tabIndex={disabled ? -1 : 0}
        >
          <svg className="flex-shrink-0" width={size} height={size} viewBox="0 0 24 24" fill={displayValue >= star ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={displayValue >= star ? 0 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}