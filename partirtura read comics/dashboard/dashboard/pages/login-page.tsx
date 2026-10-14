import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/features/authentication/schemas/login.schema'

function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/')
    }
  }, [isAuthenticated, isLoading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Error al iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isDisabled = isSubmitting

  return (
    <div className="h-full bg-nepsBg font-sans flex flex-col justify-between relative overflow-x-hidden">
      {/* Glows de Fondo */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-white">&lt;neps<span className="text-nepsAccent">/</span>&gt;</div>
            <span className="text-xs uppercase tracking-widest text-nepsMuted font-semibold border-l border-nepsBorder pl-3 ml-1">Admin Control Panel</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-nepsCard border border-nepsBorder rounded-2xl p-6 sm:p-8 shadow-glow-blue space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Acceso al Dashboard</h1>
            <p className="text-xs text-nepsMuted">Ingresá tus credenciales autorizadas de gestión</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-nepsText">Usuario o Correo</label>
              <input
                type="email"
                placeholder="admin@neps.dev"
                {...register('email')}
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary focus:ring-1 focus:ring-nepsPrimary text-xs text-white placeholder-slate-600 rounded-lg px-3.5 py-2.5 outline-none transition-all"
              />
              {errors.email && <p className="text-xs text-nepsAccent">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-nepsText">Contraseña</label>
                <Link to="/forgot-password" className="text-[11px] text-nepsPrimary hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary focus:ring-1 focus:ring-nepsPrimary text-xs text-white placeholder-slate-600 rounded-lg px-3.5 py-2.5 outline-none transition-all"
              />
              {errors.password && <p className="text-xs text-nepsAccent">{errors.password.message}</p>}
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
              {isSubmitting ? 'Ingresando...' : 'Ingresar al Panel'}
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

export default LoginPage
