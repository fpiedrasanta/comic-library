import { useState, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  labelClassName?: string
  containerClassName?: string
  showHint?: boolean
  showRules?: boolean
  rules?: PasswordRule[]
}

export interface PasswordRule {
  label: string
  isValid: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      labelClassName,
      containerClassName,
      showHint = false,
      showRules = false,
      rules = [],
      className,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false)

    return (
      <div className={cn('flex flex-col', containerClassName)}>
        {label && (
          <label className={cn('block text-xs font-medium text-neps-muted mb-1', labelClassName)}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={isVisible ? 'text' : 'password'}
            className={cn(
              'w-full bg-neps-input border border-neps-border',
              'focus:border-neps-primary focus:ring-1 focus:ring-neps-primary',
              'text-neps-text placeholder-slate-600',
              'rounded-lg px-3.5 py-2.5 text-xs sm:text-sm',
              'outline-none transition-all duration-200 pr-10',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neps-muted hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isVisible ? (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.98 3.98 12 12M12 12l8.02 8.02M12 12l-8.02-8.02"
                  />
                </>
              ) : (
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
        {showHint && (
          <p className="text-[10px] text-neps-muted mt-1">Mínimo 8 caracteres</p>
        )}
        {showRules && rules.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {rules.map((rule, index) => (
              <li
                key={index}
                className={cn(
                  'text-[10px] flex items-center gap-1.5',
                  rule.isValid ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                <span>{rule.isValid ? '✓' : '✗'}</span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
