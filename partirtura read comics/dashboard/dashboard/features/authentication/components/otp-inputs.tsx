import { useEffect, useRef, useCallback } from 'react'

interface OtpInputsProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function OtpInputs({ value, onChange, disabled }: OtpInputsProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      const digit = inputValue.replace(/\D/g, '').slice(-1)
      if (!digit) return

      const newValue = value.slice(0, index) + digit + value.slice(index + 1)
      onChange(newValue)

      if (index < 5) {
        inputsRef.current[index + 1]?.focus()
      }
    },
    [onChange, value]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const currentValue = value[index]
        if (currentValue) {
          const newValue = value.slice(0, index) + value.slice(index + 1)
          onChange(newValue)
        } else if (index > 0) {
          inputsRef.current[index - 1]?.focus()
        }
      }
    },
    [onChange, value]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()
      const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      if (paste) {
        onChange(paste)
        const focusIndex = Math.min(paste.length, 5)
        inputsRef.current[focusIndex]?.focus()
      }
    },
    [onChange]
  )

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  return (
    <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 bg-nepsInput border border-nepsBorder focus:border-nepsPrimary focus:ring-1 focus:ring-nepsPrimary text-center text-xl font-bold text-white rounded-xl outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  )
}

export default OtpInputs
