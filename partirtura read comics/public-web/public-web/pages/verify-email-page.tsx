import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authenticationRepository } from '@/features/authentication/api'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import { AuthCenteredCard, OtpInputs } from '@/features/authentication/components'
import type { RequestError } from '@/types/api'
import { useCountdownTimer } from '@/hooks/use-countdown-timer'
import { EMAIL_VERIFICATION_EXPIRES_KEY } from '@/lib/storage-keys'

interface LocationState {
  email: string
  expiresInMinutes: number
  type?: 'register' | 'recovery'
}

function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const email = state?.email
  const expiresInMinutes = state?.expiresInMinutes ?? 0
  const { login } = useAuth()

  const [otp, setOtp] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendLoading, setIsResendLoading] = useState(false)

  const initialSeconds = expiresInMinutes * 60
  const { timeLeft, isExpired: isCodeExpired, reset: resetTimer } = useCountdownTimer({
    initialSeconds,
    storageKey: EMAIL_VERIFICATION_EXPIRES_KEY,
  })

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)

    if (!pastedText) return

    const otpArray = pastedText.split('')
    const newOtp = otpArray.join('').padEnd(6, '').split('').slice(0, 6)
    setOtp(newOtp.join(''))
  }

  const handleResend = async () => {
    if (!email || isResendLoading) return

    setIsResendLoading(true)
    setServerError(null)

    try {
      const payload = await authenticationRepository.resendValidationEmail({ email })

      const newTotalSeconds = payload.expiresInMinutes * 60
      resetTimer(newTotalSeconds)
      setOtp('')
    } catch (err) {
      const apiError = err as RequestError
      if (apiError.payload?.errors && apiError.payload.errors[0]) {
        setServerError(apiError.payload.errors[0].message)
      } else if (apiError.payload?.detail) {
        setServerError(apiError.payload.detail)
      } else {
        setServerError(apiError.message || 'Ocurrió un error al reenviar el código.')
      }
    } finally {
      setIsResendLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (otp.length < 6) {
      setServerError('Ingresá el código de 6 dígitos completo.')
      return
    }

    if (isCodeExpired) {
      setServerError('El código ha expirado. Reenviá uno nuevo.')
      return
    }

    setServerError(null)
    setIsSubmitting(true)

    try {
      const payload = await authenticationRepository.validateEmail({
        email: email!,
        code: otp,
      })

      login({
        accessToken: payload.token,
        userId: payload.user.userId,
        email: payload.user.email,
        fullName: payload.user.fullName,
        role: payload.role,
      })
      navigate('/')
    } catch (err) {
      const apiError = err as RequestError

      if (apiError.status === 404) {
        setServerError(apiError.message || 'El código es incorrecto o el usuario no fue encontrado.')
      } else if (apiError.status === 400) {
        if (apiError.payload?.errors && apiError.payload.errors[0]) {
          setServerError(apiError.payload.errors[0].message)
        } else if (apiError.payload?.detail) {
          setServerError(apiError.payload.detail)
        } else {
          setServerError(apiError.message || 'El código es incorrecto.')
        }
      } else {
        setServerError(apiError.message || 'Ocurrió un error al validar el código.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen bg-neps-bg text-neps-text antialiased font-sans flex items-center justify-center p-4 relative overflow-x-hidden">
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_15%_85%,rgba(244,63,94,0.08)_0%,transparent_70%)] pointer-events-none" />

      <AuthCenteredCard
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z"
            />
          </svg>
        }
        title="Verificá tu correo"
        subtitle={
          <>
            Ingresá el código de 6 dígitos que enviamos a{' '}
            <br />
            <span className="text-neps-primary font-semibold">{email}</span>
          </>
        }
      >
        <div className="text-center text-xs text-neps-muted mb-4">
          {timeLeft > 0
            ? `El código vence en ${timeLeft}s.`
            : 'El código ha expirado.'}
        </div>

        {serverError && (
          <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3 mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <OtpInputs
            otp={otp}
            onOtpChange={setOtp}
            onPaste={handlePaste}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting || isCodeExpired || otp.length < 6}
            className="w-full bg-neps-primary hover:bg-sky-400 text-neps-bg font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm shadow-glow-blue active:scale-[0.99]"
          >
            {isSubmitting ? 'Validando...' : 'Validar código'}
          </button>
        </form>

        <div className="text-center text-xs text-neps-muted pt-4 border-t border-neps-border">
          ¿No recibiste el código?
          <div className="mt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResendLoading || timeLeft > 0}
              className="text-neps-accent hover:text-rose-400 font-semibold disabled:text-neps-muted disabled:no-underline ml-1 transition-colors"
            >
              {isResendLoading
                ? 'Reenviando...'
                : timeLeft > 0
                  ? `Reenviar (${timeLeft}s)`
                  : 'Reenviar código'}
            </button>
          </div>
        </div>
      </AuthCenteredCard>
    </div>
  )
}

export default VerifyEmailPage
