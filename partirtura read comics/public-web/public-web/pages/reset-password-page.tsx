import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authenticationRepository } from '@/features/authentication/api'
import { usePasswordRules } from '@/features/authentication/hooks/use-password-rules'
import type { RequestError } from '@/types/api'
import { AuthCenteredCard, PasswordInput } from '@/features/authentication/components'

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/\d/, 'La contraseña debe contener al menos un número.')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula.')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula.')
      .regex(
        /[^A-Za-z0-9]/,
        'La contraseña debe contener al menos un carácter especial.',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface LocationState {
  email?: string
  authorizationToken?: string
}

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const email = state?.email
  const authorizationToken = state?.authorizationToken

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const passwordValue = useWatch({ control, name: 'newPassword', defaultValue: '' })
  const passwordRules = usePasswordRules(passwordValue)

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      await authenticationRepository.resetPassword({
        email: email!,
        authorizationToken: authorizationToken!,
        newPassword: data.newPassword,
      })

      setIsSuccess(true)
    } catch (err) {
      const apiError = err as RequestError

      if (apiError.status === 401) {
        setError(apiError.message || 'El código es incorrecto o ha expirado.')
      } else if (apiError.payload?.errors && apiError.payload.errors[0]) {
        setError(apiError.payload.errors[0].message)
      } else if (apiError.payload?.detail) {
        setError(apiError.payload.detail)
      } else {
        setError(apiError.message || 'Ocurrió un error. Intentá nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  if (!email || !authorizationToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans flex items-center justify-center p-4 relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.07)_0%,transparent_70%)] pointer-events-none" />

      {!isSuccess ? (
        <AuthCenteredCard
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          }
          title="Nueva contraseña"
          subtitle="Escribí tu nueva clave para recuperar el acceso."
        >
          {error && (
            <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <PasswordInput
              label="Nueva contraseña"
              labelClassName="mb-1"
              showRules
              rules={passwordRules}
              id="newPassword"
              {...register('newPassword')}
              placeholder="••••••••"
              containerClassName="mb-0"
            />
            {errors.newPassword && (
              <p className="text-neps-accent text-[10px] -mt-2">{errors.newPassword.message}</p>
            )}

            <PasswordInput
              label="Confirmar nueva contraseña"
              labelClassName="mb-1"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder="••••••••"
              containerClassName="mb-0"
            />
            {errors.confirmPassword && (
              <p className="text-neps-accent text-[10px] -mt-2">{errors.confirmPassword.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isFormSubmitting}
              className="w-full bg-neps-primary hover:bg-sky-400 text-neps-bg font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-glow-blue active:scale-[0.99] mt-2"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </AuthCenteredCard>
      ) : (
        <AuthCenteredCard>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 text-xl font-bold mb-4 border border-emerald-500/20">
              ✓
            </div>
            <h2 className="text-lg font-bold text-white">Contraseña actualizada</h2>
            <p className="text-xs text-neps-muted leading-relaxed">
              Tu contraseña fue modificada correctamente. Ya podés iniciar sesión con tu nueva clave.
            </p>
            <button
              type="button"
              onClick={handleGoToLogin}
              className="w-full bg-neps-primary hover:bg-sky-400 text-neps-bg font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-glow-blue active:scale-[0.99]"
            >
              Ir a Iniciar sesión
            </button>
          </div>
        </AuthCenteredCard>
      )}
    </div>
  )
}

export default ResetPasswordPage
