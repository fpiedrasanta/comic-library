import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '@/features/authentication/services/auth.service'
import { verifyCodeSchema, type VerifyCodeFormData } from '@/features/authentication/schemas/verify-code.schema'
import OtpInputs from '@/features/authentication/components/otp-inputs'

function VerifyRecoveryCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = (location.state as { email?: string })?.email || ''
  const [error, setError] = useState<string | null>(null)
  const [expiresInMinutes, setExpiresInMinutes] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isCodeExpired, setIsCodeExpired] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  })

  const codeValue = watch('code')

  const totalSeconds = (expiresInMinutes ?? 0) * 60
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password')
    }
  }, [emailFromState, navigate])

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsCodeExpired(true)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          setIsCodeExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [timeLeft])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(Math.max(0, seconds) / 60)
    const remainingSeconds = Math.max(0, seconds) % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const onSubmit = async (data: VerifyCodeFormData) => {
    if (!emailFromState) {
      setError('Falta el email. Volvé a iniciar la recuperación.')
      return
    }

    if (isCodeExpired) {
      setError('El código ha expirado. Reenviá uno nuevo.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const response = await authService.validatePasswordResetCode(emailFromState, data.code)
      navigate('/reset-password', {
        state: {
          email: emailFromState,
          authorizationToken: response.authorizationToken,
        },
      })
    } catch (err) {
      const apiError = err as { message?: string; code?: number }
      setError(apiError.message || 'Código inválido o vencido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!emailFromState || isResending || timeLeft > 0) return

    setIsResending(true)
    setError(null)
    try {
      const response = await authService.resendPasswordResetCode(emailFromState)
      setExpiresInMinutes(response.expiresInMinutes)
      setTimeLeft((response.expiresInMinutes ?? 0) * 60)
      setIsCodeExpired(false)
      setValue('code', '')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Error al reenviar el código.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="h-full bg-nepsBg font-sans flex flex-col justify-between relative overflow-x-hidden">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_15%_85%,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/forgot-password')} className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-white">&lt;neps<span className="text-nepsAccent">/</span>&gt;</div>
            <span className="text-xs uppercase tracking-widest text-nepsMuted font-semibold border-l border-nepsBorder pl-3 ml-1">Admin Control Panel</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-nepsCard border border-nepsBorder rounded-2xl p-6 sm:p-8 shadow-glow-blue space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nepsPrimary/10 text-nepsPrimary border border-nepsPrimary/20 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 012 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Ingresá tu código</h1>
            <p className="text-xs text-nepsMuted">
              Enviamos una clave de 6 dígitos a <span className="text-white font-medium">{emailFromState ? `${emailFromState[0]}***${emailFromState.split('@')[1]}` : ''}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <OtpInputs
              value={codeValue}
              onChange={(val) => setValue('code', val)}
              disabled={isSubmitting}
            />

            {errors.code && <p className="text-xs text-nepsAccent text-center">{errors.code.message}</p>}

            {error && (
              <div className="bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent text-xs rounded-lg p-3 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isCodeExpired || codeValue.length !== 6}
              className="w-full py-2.5 bg-nepsPrimary hover:bg-sky-300 text-nepsBg font-bold text-xs rounded-lg shadow-glow-blue transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verificando...' : 'Validar código'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-nepsBorder/60 space-y-2">
            <p className="text-xs text-nepsMuted">
              {timeLeft > 0
                ? `El código vence en ${formatTime(timeLeft)}.`
                : 'El código ha expirado.'}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || timeLeft > 0}
              className="text-nepsPrimary hover:underline font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending
                ? 'Reenviando...'
                : timeLeft > 0
                  ? `Reenviar (${formatTime(timeLeft)})`
                  : 'Reenviar código'}
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-nepsMuted border-t border-nepsBorder/50">
        &copy; 2026 Comic Library Admin. Sistema Privado.
      </footer>
    </div>
  )
}

export default VerifyRecoveryCodePage
