import { useMemo } from 'react'
import type { PasswordRule } from '@/features/authentication/components/password-input'

export function usePasswordRules(password: string): PasswordRule[] {
  return useMemo(
    () => [
      {
        label: 'Mínimo 8 caracteres',
        isValid: password.length >= 8,
      },
      {
        label: 'Al menos un número',
        isValid: /\d/.test(password),
      },
      {
        label: 'Al menos una letra minúscula',
        isValid: /[a-z]/.test(password),
      },
      {
        label: 'Al menos una letra mayúscula',
        isValid: /[A-Z]/.test(password),
      },
      {
        label: 'Al menos un carácter especial',
        isValid: /[^A-Za-z0-9]/.test(password),
      },
    ],
    [password],
  )
}
