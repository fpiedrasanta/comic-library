import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/features/authentication/services/auth.service'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/authentication/schemas/reset-password.schema'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { email?: string; authorizationToken?: string } | null
  const email = state?.email || ''
  const authorizationToken = state?.authorizationToken || ''
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !authorizationToken) {
      setError('Faltan datos de la sesión. Volvé a iniciar la recuperación.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      await authService.resetPassword(email, authorizationToken, data.newPassword)
      navigate('/login')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Error al cambiar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting || formSubmitting

  return (
    <div className="h-full bg-nepsBg font-sans flex flex-col justify-between relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-white">&lt;neps<span className="text-nepsAccent">/</span>&gt;</div>
            <span className="text-xs uppercase tracking-widest text-nepsMuted font-semibold border-l border-nepsBorder pl-3 ml-1">Admin Control Panel</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-nepsCard border border-nepsBorder rounded-2xl p-6 sm:p-8 shadow-glow-blue space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Reestablecer contraseña</h1>
            <p className="text-xs text-nepsMuted">Creá una nueva clave para acceder al panel de administración.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-nepsText">Nueva Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('newPassword')}
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary focus:ring-1 focus:ring-nepsPrimary text-xs text-white placeholder-slate-600 rounded-lg px-3.5 py-2.5 outline-none transition-all"
              />
              {errors.newPassword && <p className="text-xs text-nepsAccent">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-nepsText">Repetir Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary focus:ring-1 focus:ring-nepsPrimary text-xs text-white placeholder-slate-600 rounded-lg px-3.5 py-2.5 outline-none transition-all"
              />
              {errors.confirmPassword && <p className="text-xs text-nepsAccent">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent text-xs rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full py-2.5 bg-nepsPrimary hover:bg-sky-300 text-nepsBg font-bold text-xs rounded-lg shadow-glow-blue transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar y Entrar'}
            </button>
          </form>

        </div>
      </main>

      <footer className="py-6 text-center text-xs text-nepsMuted border-t border-nepsBorder/50">
        &copy; 2026 Comic Library Admin. Sistema Privado.
      </footer>
    </div>
  )
}

export default ResetPasswordPage
