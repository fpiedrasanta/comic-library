import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authenticationRepository } from '@/features/authentication/api'
import type { RequestError } from '@/types/api'
import { AuthCenteredCard } from '@/features/authentication/components'
import { RECOVERY_CODE_EXPIRES_KEY } from '@/lib/storage-keys'

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresá un email válido.'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const inputClasses =
  'w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-neps-text placeholder-slate-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-all duration-200'

const labelClasses =
  'block text-xs font-medium text-neps-muted mb-1.5'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await authenticationRepository.forgotPassword({ email: data.email })

      const expiresAt = Date.now() + result.expiresInMinutes * 60 * 1000
      sessionStorage.setItem(RECOVERY_CODE_EXPIRES_KEY, String(expiresAt))

      navigate('/verify-recovery-code', {
        state: { email: data.email },
      })
    } catch (err) {
      const apiError = err as RequestError
      setError(apiError.message || 'Ocurrió un error. Intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans flex items-center justify-center p-4 relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.07)_0%,transparent_70%)] pointer-events-none" />

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
        title="Recuperá tu cuenta"
        subtitle="Restablecé tu contraseña para recuperar el acceso a tu colección."
      >
        {error && (
          <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="text-center text-xs text-neps-muted mb-5">
          Ingresá el correo electrónico asociado a tu cuenta. Si la cuenta existe, te enviaremos un código para restablecer tu contraseña.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  placeholder="tu@email.com"
                  className={inputClasses}
                />
                {errors.email && (
                  <p className="text-neps-accent text-[10px] mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neps-primary hover:bg-sky-400 text-neps-bg font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-glow-blue active:scale-[0.99]"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar código de recuperación'}
              </button>
            </form>

        <div className="text-center text-xs text-neps-muted mt-6">
          <Link
            to="/login"
            className="hover:text-white transition-colors font-medium"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </AuthCenteredCard>
    </div>
  )
}

export default ForgotPasswordPage
