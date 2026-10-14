import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import { authenticationRepository } from '@/features/authentication/api'
import type { RequestError } from '@/types/api'
import { OtpInputs, PasswordInput } from '@/features/authentication/components'
import { usePasswordRules } from '@/features/authentication/hooks/use-password-rules'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatTime } from '@/lib/date-utils'
import { useCountdownTimer } from '@/hooks/use-countdown-timer'
import {
  SETTINGS_PASSWORD_CHANGE_EXPIRES_KEY,
  ACCOUNT_DELETION_EXPIRES_KEY,
} from '@/lib/storage-keys'

const changePasswordSchema = z
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

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

type Step = 1 | 2 | 3 | 4

function SettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { logout } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendLoading, setIsResendLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(null)
  const [isLogoutAllSubmitting, setIsLogoutAllSubmitting] = useState(false)
  const [logoutAllError, setLogoutAllError] = useState<string | null>(null)
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false)

  const [deleteStep, setDeleteStep] = useState(1)
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)
  const [deleteIsSubmitting, setDeleteIsSubmitting] = useState(false)
  const [deleteIsResendLoading, setDeleteIsResendLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const passwordValue = useWatch({ control, name: 'newPassword', defaultValue: '' })
  const passwordRules = usePasswordRules(passwordValue)

  const {
    timeLeft,
    isExpired: isCodeExpired,
    reset: resetPasswordTimer,
  } = useCountdownTimer({
    initialSeconds: 0,
    storageKey: SETTINGS_PASSWORD_CHANGE_EXPIRES_KEY,
  })

  const {
    timeLeft: deleteTimeLeft,
    isExpired: deleteIsCodeExpired,
    reset: resetDeleteTimer,
  } = useCountdownTimer({
    initialSeconds: 0,
    storageKey: ACCOUNT_DELETION_EXPIRES_KEY,
  })

  const handleRequestCode = async () => {
    if (!user?.email) return

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const result = await authenticationRepository.forgotPassword({ email: user.email })
      const totalSeconds = result.expiresInMinutes * 60
      resetPasswordTimer(totalSeconds)
      setStep(2)
    } catch (err) {
      const apiError = err as RequestError
      setError(apiError.message || 'Ocurrió un error al solicitar el código.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!user?.email || isResendLoading) return

    setIsResendLoading(true)
    setError(null)

    try {
      const payload = await authenticationRepository.resendPasswordResetCode({ email: user.email })
      const totalSeconds = payload.expiresInMinutes * 60
      resetPasswordTimer(totalSeconds)
      setOtp('')
    } catch (err) {
      const apiError = err as RequestError
      if (apiError.payload?.errors && apiError.payload.errors[0]) {
        setError(apiError.payload.errors[0].message)
      } else if (apiError.payload?.detail) {
        setError(apiError.payload.detail)
      } else {
        setError(apiError.message || 'Ocurrió un error al reenviar el código.')
      }
    } finally {
      setIsResendLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length < 6) {
      setError('Ingresá el código de 6 dígitos completo.')
      return
    }

    if (isCodeExpired) {
      setError('El código ha expirado. Reenviá uno nuevo.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const payload = await authenticationRepository.validatePasswordResetCode({
        email: user!.email,
        code: otp,
      })
      setAuthorizationToken(payload.authorizationToken)
      setStep(3)
    } catch (err) {
      const apiError = err as RequestError
      if (apiError.status === 401) {
        setError(apiError.message || 'El código es incorrecto o ha expirado.')
      } else if (apiError.status === 400) {
        if (apiError.payload?.errors && apiError.payload.errors[0]) {
          setError(apiError.payload.errors[0].message)
        } else if (apiError.payload?.detail) {
          setError(apiError.payload.detail)
        } else {
          setError(apiError.message || 'El código es incorrecto.')
        }
      } else {
        setError(apiError.message || 'Ocurrió un error al validar el código.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewPasswordSubmit = async (data: ChangePasswordFormData) => {
    if (!user?.email || !authorizationToken) return

    setError(null)
    setIsSubmitting(true)

    try {
      await authenticationRepository.resetPassword({
        email: user.email,
        authorizationToken,
        newPassword: data.newPassword,
      })
      setSuccess('Contraseña actualizada correctamente.')
      setStep(4)
    } catch (err) {
      const apiError = err as RequestError
      if (apiError.status === 401) {
        setError(apiError.message || 'El código es incorrecto o ha expirado.')
      } else if (apiError.payload?.errors && apiError.payload.errors[0]) {
        setError(apiError.payload.errors[0].message)
      } else if (apiError.payload?.detail) {
        setError(apiError.payload.detail)
      } else {
        setError(apiError.message || 'Ocurrió un error al cambiar la contraseña.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pastedText) return
    const otpArray = pastedText.split('')
    const newOtp = otpArray.join('').padEnd(6, '').split('').slice(0, 6)
    setOtp(newOtp.join(''))
  }

  const handleDeleteRequestCode = async () => {
    setDeleteError(null)
    setDeleteSuccess(null)
    setDeleteIsSubmitting(true)

    try {
      const result = await authenticationRepository.requestAccountDeletion()
      const totalSeconds = result.expiresInMinutes * 60
      resetDeleteTimer(totalSeconds)
      setDeleteStep(2)
    } catch (err) {
      const apiError = err as RequestError
      setDeleteError(apiError.message || 'Ocurrió un error al solicitar el código de baja.')
    } finally {
      setDeleteIsSubmitting(false)
    }
  }

  const handleDeleteResend = async () => {
    if (deleteIsResendLoading) return

    setDeleteIsResendLoading(true)
    setDeleteError(null)

    try {
      const payload = await authenticationRepository.requestAccountDeletion()
      const totalSeconds = payload.expiresInMinutes * 60
      resetDeleteTimer(totalSeconds)
      setDeleteOtp('')
    } catch (err) {
      const apiError = err as RequestError
      if (apiError.payload?.errors && apiError.payload.errors[0]) {
        setDeleteError(apiError.payload.errors[0].message)
      } else if (apiError.payload?.detail) {
        setDeleteError(apiError.payload.detail)
      } else {
        setDeleteError(apiError.message || 'Ocurrió un error al reenviar el código.')
      }
    } finally {
      setDeleteIsResendLoading(false)
    }
  }

  const handleDeleteOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (deleteOtp.length < 6) {
      setDeleteError('Ingresá el código de 6 dígitos completo.')
      return
    }

    if (deleteIsCodeExpired) {
      setDeleteError('El código ha expirado. Reenviá uno nuevo.')
      return
    }

    setDeleteError(null)
    setDeleteIsSubmitting(true)

    try {
      await authenticationRepository.confirmAccountDeletion(deleteOtp)
      setDeleteSuccess('Tu cuenta ha sido eliminada correctamente.')
      setDeleteStep(3)
    } catch (err) {
      const apiError = err as RequestError
      if (apiError.status === 409) {
        setDeleteError(apiError.message || 'El código es incorrecto o ha expirado.')
      } else if (apiError.status === 400) {
        if (apiError.payload?.errors && apiError.payload.errors[0]) {
          setDeleteError(apiError.payload.errors[0].message)
        } else if (apiError.payload?.detail) {
          setDeleteError(apiError.payload.detail)
        } else {
          setDeleteError(apiError.message || 'El código es incorrecto.')
        }
      } else {
        setDeleteError(apiError.message || 'Ocurrió un error al confirmar la baja.')
      }
    } finally {
      setDeleteIsSubmitting(false)
    }
  }

  const handleDeletePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (!pastedText) return
    const otpArray = pastedText.split('')
    const newOtp = otpArray.join('').padEnd(6, '').split('').slice(0, 6)
    setDeleteOtp(newOtp.join(''))
  }

  const handleLogoutAll = async () => {
    setLogoutAllError(null)
    setIsLogoutAllSubmitting(true)

    try {
      await authenticationRepository.logoutAll()
      await logout()
    } catch (err) {
      const apiError = err as RequestError
      setLogoutAllError(apiError.message || 'Ocurrió un error al cerrar todas las sesiones.')
      setIsLogoutAllSubmitting(false)
    }
  }

  useEffect(() => {
    if (deleteStep === 3 && deleteSuccess) {
      const timer = setTimeout(() => {
        logout()
        navigate('/login')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [deleteStep, deleteSuccess, logout, navigate])

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Seguridad y Cuenta</h1>
        <p className="text-xs text-neps-muted">Administrá tus credenciales y preferencias de acceso.</p>
      </div>

      <section className="bg-neps-card border border-neps-border rounded-2xl p-6 shadow-glow-blue space-y-6">
        <div className="border-b border-neps-border/60 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-neps-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Cambiar Contraseña
          </h2>
        </div>

        {(error || success) && (
          <div
            className={`text-xs rounded-lg px-4 py-3 ${
              error
                ? 'bg-neps-accent/10 border border-neps-accent/30 text-red-200'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
            }`}
          >
            {error || success}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-neps-muted leading-relaxed">
              Para garantizar la seguridad de tu cuenta, te enviaremos un código de validación de 6 dígitos a tu correo electrónico registrado antes de proceder con el cambio.
            </p>
            <button
              type="button"
              onClick={handleRequestCode}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-neps-primary hover:bg-sky-300 text-neps-bg font-bold text-xs rounded-lg transition-all active:scale-95 shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Cambiar contraseña'}
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-xs text-neps-muted">
              Tenés <span className="text-neps-primary font-bold">{formatTime(timeLeft)}</span> para ingresar el código enviado a tu correo:
            </p>
            <OtpInputs
              otp={otp}
              onOtpChange={setOtp}
              onPaste={handlePaste}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || isCodeExpired || otp.length < 6}
              className="px-5 py-2.5 bg-neps-primary hover:bg-sky-300 text-neps-bg font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Validando...' : 'Aceptar'}
            </button>

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
                      ? `Reenviar (${formatTime(timeLeft)})`
                      : 'Reenviar código'}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(handleNewPasswordSubmit)} className="space-y-4">
            <div className="space-y-3 max-w-md">
              <PasswordInput
                label="Nueva contraseña"
                showRules
                rules={passwordRules}
                id="newPassword"
                {...register('newPassword')}
                placeholder="••••••••"
              />
              {errors.newPassword && (
                <p className="text-neps-accent text-[10px] -mt-2">{errors.newPassword.message}</p>
              )}

              <PasswordInput
                label="Repetir nueva contraseña"
                id="confirmPassword"
                {...register('confirmPassword')}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-neps-accent text-[10px] -mt-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isFormSubmitting}
              className="px-5 py-2.5 bg-neps-primary hover:bg-sky-300 text-neps-bg font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar cambio'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 text-xl font-bold mb-4 border border-emerald-500/20">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">Contraseña actualizada</h3>
            <p className="text-xs text-neps-muted">Tu contraseña fue modificada correctamente.</p>
          </div>
        )}
      </section>

      <section className="bg-neps-card border border-neps-border rounded-2xl p-6 shadow-glow-blue space-y-6">
        <div className="border-b border-neps-border/60 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-neps-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar todas las sesiones
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-neps-muted leading-relaxed">
            Esta acción cerrará todas las sesiones activas de tu cuenta, incluyendo esta. Los demás dispositivos deberán volver a autenticarse.
          </p>

          {logoutAllError && (
            <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3">
              {logoutAllError}
            </div>
          )}

          {!showLogoutAllConfirm ? (
            <button
              type="button"
              onClick={() => setShowLogoutAllConfirm(true)}
              className="px-4 py-2.5 bg-neps-primary hover:bg-sky-300 text-neps-bg font-bold text-xs rounded-lg transition-all active:scale-95 shadow-glow-blue"
            >
              Cerrar todas las sesiones
            </button>
          ) : (
            <div className="bg-neps-input border border-neps-border rounded-xl p-4 space-y-3">
              <p className="text-xs text-neps-text">
                ¿Estás seguro? Esta acción cerrará todas las sesiones activas, incluyendo esta.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutAllConfirm(false)}
                  disabled={isLogoutAllSubmitting}
                  className="px-4 py-2 bg-neps-card border border-neps-border hover:bg-neps-border text-neps-text font-medium text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  disabled={isLogoutAllSubmitting}
                  className="px-4 py-2 bg-neps-accent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLogoutAllSubmitting ? 'Cerrando...' : 'Confirmar cierre'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-neps-card border border-neps-accent/30 rounded-2xl p-6 shadow-glow-pink space-y-6">
        <div className="border-b border-neps-border/60 pb-4">
          <h2 className="text-base font-bold text-neps-accent flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Zona Peligrosa: Dar de baja la cuenta
          </h2>
        </div>

        <div className="space-y-4">
          {deleteError && (
            <div className="bg-neps-accent/10 border border-neps-accent/30 text-red-200 text-xs rounded-lg px-4 py-3">
              {deleteError}
            </div>
          )}

          {deleteStep === 1 && !deleteSuccess && (
            <div className="bg-neps-input border border-neps-border rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <p>• Si eliminás la cuenta no podrás volver a loguearte con este usuario.</p>
              <p>• El correo vuelve a quedar disponible para registrarse nuevamente cuando quieras, pero perderás todos los datos de tus lecturas actuales.</p>
              <p>• Se enviará un código a tu correo para confirmar la operación.</p>
            </div>
          )}

          {deleteStep === 1 && !deleteSuccess && (
            <button
              type="button"
              onClick={handleDeleteRequestCode}
              disabled={deleteIsSubmitting}
              className="px-4 py-2.5 bg-neps-accent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteIsSubmitting ? 'Enviando...' : 'Dar de baja la cuenta'}
            </button>
          )}

          {deleteStep === 2 && !deleteSuccess && (
            <form onSubmit={handleDeleteOtpSubmit} className="space-y-4">
              <p className="text-xs text-neps-muted">
                Tenés <span className="text-neps-primary font-bold">{formatTime(deleteTimeLeft)}</span> para ingresar el código enviado a tu correo:
              </p>
              <OtpInputs
                otp={deleteOtp}
                onOtpChange={setDeleteOtp}
                onPaste={handleDeletePaste}
                disabled={deleteIsSubmitting}
              />
              <button
                type="submit"
                disabled={deleteIsSubmitting || deleteIsCodeExpired || deleteOtp.length < 6}
                className="px-5 py-2.5 bg-neps-accent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteIsSubmitting ? 'Validando...' : 'Aceptar'}
              </button>

              <div className="text-center text-xs text-neps-muted pt-4 border-t border-neps-border">
                ¿No recibiste el código?
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleDeleteResend}
                    disabled={deleteIsResendLoading || deleteTimeLeft > 0}
                    className="text-neps-accent hover:text-rose-400 font-semibold disabled:text-neps-muted disabled:no-underline ml-1 transition-colors"
                  >
                    {deleteIsResendLoading
                      ? 'Reenviando...'
                      : deleteTimeLeft > 0
                        ? `Reenviar (${formatTime(deleteTimeLeft)})`
                        : 'Reenviar código'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {deleteStep === 3 && deleteSuccess && (
            <div className="text-center py-6 space-y-3">
              <div className="text-4xl">💔</div>
              <h3 className="text-lg font-bold text-white">Te vamos a extrañar...</h3>
              <p className="text-xs text-neps-muted">Tu cuenta y registros han sido eliminados correctamente.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default SettingsPage
