import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { authenticationRepository } from '@/features/authentication/api'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import type { RequestError } from '@/types/api'
import { AuthSplitLayout, PasswordInput } from '@/features/authentication/components'

const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
})

type LoginFormData = z.infer<typeof loginSchema>

const inputClasses =
  'w-full bg-neps-input border border-neps-border focus:border-neps-primary focus:ring-1 focus:ring-neps-primary text-neps-text placeholder-slate-600 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm outline-none transition-all duration-200'

const labelClasses =
  'block text-xs font-medium text-neps-muted mb-1.5'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const [isResolvingClientId, setIsResolvingClientId] = useState(false)
  const googleLoginContainerRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (googleClientId) {
      setIsGoogleLoading(true)
      triggerGoogleLogin()
    }
  }, [googleClientId])

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      return
    }

    setIsGoogleLoading(true)
    setGoogleError(null)

    try {
      const payload = await authenticationRepository.googleLogin({
        idToken: credentialResponse.credential,
      })

      login(payload)
      navigate('/')
    } catch {
      setGoogleError(
        'Se generó un error autenticando con Google, intente nuevamente en unos minutos.',
      )
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setIsGoogleLoading(false)
    setGoogleError(
      'Se generó un error autenticando con Google, intente nuevamente en unos minutos.',
    )
  }

  const triggerGoogleLogin = () => {
    setGoogleError(null)
    let attempts = 0
    const maxAttempts = 30
    const interval = 100

    const tryClick = () => {
      const button = googleLoginContainerRef.current?.querySelector(
        'div[role="button"], div[aria-label]',
      ) as HTMLElement | null
      if (button) {
        button.click()
        return
      }
      attempts += 1
      if (attempts < maxAttempts) {
        setTimeout(tryClick, interval)
      } else {
        setGoogleError(
          'Se generó un error autenticando con Google, intente nuevamente en unos minutos.',
        )
        setIsGoogleLoading(false)
      }
    }
    tryClick()
  }

  const handleGoogleClick = async () => {
    setGoogleError(null)
    setIsGoogleLoading(false)
    if (googleClientId) {
      setIsGoogleLoading(true)
      triggerGoogleLogin()
      return
    }

    setIsResolvingClientId(true)
    try {
      const result = await Promise.race([
        authenticationRepository.getGoogleClientId(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000),
        ),
      ])
      setGoogleClientId(result.clientId)
    } catch {
      setGoogleError(
        'Se generó un error autenticando con Google, intente nuevamente en unos minutos.',
      )
      setIsGoogleLoading(false)
    } finally {
      setIsResolvingClientId(false)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setError(null)

    try {
      const payload = await authenticationRepository.login({
        email: data.email,
        password: data.password,
      })

      login(payload)
      navigate('/')
    } catch (err) {
      const apiError = err as RequestError

      if (apiError.status === 401) {
        setError(apiError.message || 'Credenciales incorrectas.')
      } else {
        setError(apiError.message || 'Ocurrió un error inesperado. Intentá nuevamente.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.07)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[450px] h-[450px] bg-[radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.07)_0%,transparent_70%)] pointer-events-none" />

      <AuthSplitLayout
        heroTitle={
          <>
            Tu colección digital,{' '}
            <span className="text-neps-primary">organizada y centralizada.</span>
          </>
        }
        heroDescription="Accedé a tu catálogo, registrá tu progreso de lectura página a página y gestioná tus arcos argumentales."
        statusText="Sistema Operativo"
      >
        <div className="md:hidden text-center mb-6">
          <div className="text-2xl font-black tracking-tight text-white">
            &lt;neps<span className="text-neps-accent">/</span>&gt;
          </div>
          <p className="text-[10px] uppercase tracking-widest text-neps-muted font-semibold mt-0.5">
            Comic Library
          </p>
        </div>

        <div className="mb-6 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ¡Hola de nuevo! 👋
          </h1>
          <p className="text-xs sm:text-sm text-neps-muted mt-1">
            Ingresá tus credenciales para continuar.
          </p>
        </div>

        {googleClientId && (
          <GoogleOAuthProvider clientId={googleClientId}>
            <div ref={googleLoginContainerRef} className="hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                type="standard"
                theme="outline"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
              />
            </div>
          </GoogleOAuthProvider>
        )}

        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isSubmitting || isGoogleLoading || isResolvingClientId}
          className="w-full flex items-center justify-center gap-3 bg-neps-input hover:bg-[#101725] border border-neps-border hover:border-neps-primary/50 text-neps-text font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          <span className="group-hover:text-white transition-colors">
            {isResolvingClientId
              ? 'Preparando Google...'
              : isGoogleLoading
                ? 'Autenticando...'
                : 'Continuar con Google'}
          </span>
        </button>

        {googleError && !isGoogleLoading && (
          <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3 mb-4">
            {googleError}
          </div>
        )}

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neps-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-neps-card px-3 text-neps-muted font-medium">o con tu email</span>
          </div>
        </div>

        {error && (
          <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

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

          <PasswordInput
            label="Contraseña"
            labelClassName="mb-1.5"
            showHint
            id="password"
            {...register('password')}
            placeholder="••••••••••••"
          />
          {errors.password && (
            <p className="text-neps-accent text-[10px] mt-1 -mt-2">{errors.password.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full bg-neps-primary hover:bg-sky-400 text-neps-bg font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-glow-blue active:scale-[0.99] mt-2"
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-xs text-neps-muted mt-6">
          ¿No tenés una cuenta?{' '}
          <Link
            to="/register"
            className="text-neps-accent font-semibold hover:text-rose-400 transition-colors ml-1"
          >
            Registrate
          </Link>
        </p>

        <p className="text-center text-xs text-neps-muted mt-2">
          <Link
            to="/forgot-password"
            className="text-neps-primary hover:text-sky-400 font-semibold transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </AuthSplitLayout>
    </div>
  )
}

export default LoginPage
