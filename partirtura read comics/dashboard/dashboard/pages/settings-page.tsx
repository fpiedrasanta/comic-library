import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/authentication/hooks/use-auth'
import { useAuthStore } from '../store/auth-store'
import { authService } from '../features/authentication/services/auth.service'
import PasswordInput from '../features/authentication/components/password-input'
import { usePasswordRules } from '../features/authentication/hooks/use-password-rules'
import { resetPasswordSchema, type ResetPasswordFormData } from '../features/authentication/schemas/reset-password.schema'
import OtpInputs from '../features/authentication/components/otp-inputs'
import { useDashboardPageHeader } from '../pages/dashboard-layout'

type Step = 'request' | 'otp' | 'reset'
type DeletionStep = 'idle' | 'code' | 'confirm'

function SettingsPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  useEffect(() => {
    setPageTitle('Ajustes')
    setPageActions(null)
  }, [setPageTitle, setPageActions])

  const [step, setStep] = useState<Step>('request')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [authorizationToken, setAuthorizationToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false)
  const [isLogoutAllSubmitting, setIsLogoutAllSubmitting] = useState(false)
  const [logoutAllError, setLogoutAllError] = useState<string | null>(null)
  const [logoutAllSuccess, setLogoutAllSuccess] = useState<string | null>(null)
  const [deletionStep, setDeletionStep] = useState<DeletionStep>('idle')
  const [deletionError, setDeletionError] = useState<string | null>(null)
  const [deletionSuccess, setDeletionSuccess] = useState<string | null>(null)
  const [deletionCode, setDeletionCode] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletionResending, setIsDeletionResending] = useState(false)
  const [changePasswordCode, setChangePasswordCode] = useState('')

  const email = user?.email || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const newPassword = watch('newPassword', '')
  const confirmPassword = watch('confirmPassword', '')
  const passwordRules = usePasswordRules(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== ''
  const allRulesValid = passwordRules.every((rule) => rule.isValid) && passwordsMatch

  const [changePasswordTimeLeft, setChangePasswordTimeLeft] = useState<number | null>(null)
  const changePasswordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isChangePasswordCodeExpired, setIsChangePasswordCodeExpired] = useState(false)

  const [deletionTimeLeft, setDeletionTimeLeft] = useState<number | null>(null)
  const deletionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isDeletionCodeExpired, setIsDeletionCodeExpired] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!email && !authLoading) {
      navigate('/login')
    }
  }, [email, authLoading, navigate])

  useEffect(() => {
    if (changePasswordTimeLeft === null || changePasswordTimeLeft <= 0) {
      if (changePasswordTimeLeft === 0) {
        setIsChangePasswordCodeExpired(true)
      }
      return
    }

    changePasswordTimerRef.current = setInterval(() => {
      setChangePasswordTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (changePasswordTimerRef.current) {
            clearInterval(changePasswordTimerRef.current)
            changePasswordTimerRef.current = null
          }
          setIsChangePasswordCodeExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (changePasswordTimerRef.current) {
        clearInterval(changePasswordTimerRef.current)
        changePasswordTimerRef.current = null
      }
    }
  }, [changePasswordTimeLeft])

  useEffect(() => {
    if (deletionTimeLeft === null || deletionTimeLeft <= 0) {
      if (deletionTimeLeft === 0) {
        setIsDeletionCodeExpired(true)
      }
      return
    }

    deletionTimerRef.current = setInterval(() => {
      setDeletionTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          if (deletionTimerRef.current) {
            clearInterval(deletionTimerRef.current)
            deletionTimerRef.current = null
          }
          setIsDeletionCodeExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (deletionTimerRef.current) {
        clearInterval(deletionTimerRef.current)
        deletionTimerRef.current = null
      }
    }
  }, [deletionTimeLeft])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(Math.max(0, seconds) / 60)
    const remainingSeconds = Math.max(0, seconds) % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleRequestCode = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await authService.forgotPassword(email)
      setChangePasswordTimeLeft((response.expiresInMinutes ?? 0) * 60)
      setStep('otp')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Error al solicitar el código.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (code: string) => {
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await authService.validatePasswordResetCode(email, code)
      setAuthorizationToken(response.authorizationToken)
      setStep('reset')
    } catch (err) {
      const apiError = err as { message?: string; code?: number }
      setError(apiError.message || 'Código inválido o vencido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (isResending || (changePasswordTimeLeft ?? 0) > 0) return

    setIsResending(true)
    setError(null)
    try {
      const response = await authService.resendPasswordResetCode(email)
      setChangePasswordTimeLeft((response.expiresInMinutes ?? 0) * 60)
      setIsChangePasswordCodeExpired(false)
      setChangePasswordCode('')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Error al reenviar el código.')
    } finally {
      setIsResending(false)
    }
  }

  const onSubmitReset = async (data: ResetPasswordFormData) => {
    if (!authorizationToken) {
      setError('Faltan datos de la sesión. Volvé a iniciar la recuperación.')
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      await authService.resetPassword(email, authorizationToken, data.newPassword)
      setSuccess('Contraseña actualizada correctamente.')
      setStep('request')
      setAuthorizationToken(null)
      setChangePasswordTimeLeft(null)
      setIsChangePasswordCodeExpired(false)
      setChangePasswordCode('')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Error al cambiar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoutAll = () => {
    setLogoutAllError(null)
    setLogoutAllSuccess(null)
    setShowLogoutAllConfirm(true)
  }

  const confirmLogoutAll = async () => {
    setLogoutAllError(null)
    setLogoutAllSuccess(null)
    setIsLogoutAllSubmitting(true)
    try {
      await authService.logoutAll()
      useAuthStore.getState().logout()
      setLogoutAllSuccess('Todas las sesiones fueron cerradas correctamente.')
      setShowLogoutAllConfirm(false)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const apiError = err as { message?: string }
      setLogoutAllError(apiError.message || 'Error al cerrar todas las sesiones.')
      setShowLogoutAllConfirm(false)
    } finally {
      setIsLogoutAllSubmitting(false)
    }
  }

  const cancelLogoutAll = () => {
    setShowLogoutAllConfirm(false)
    setLogoutAllError(null)
  }

  const handleRequestDeletionCode = async () => {
    setDeletionError(null)
    setIsDeleting(true)
    setDeletionCode('')
    try {
      const response = await authService.requestAccountDeletion()
      setDeletionTimeLeft((response.expiresInMinutes ?? 0) * 60)
      setDeletionStep('code')
    } catch (err) {
      const apiError = err as { message?: string }
      setDeletionError(apiError.message || 'Error al solicitar el código de baja.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmDeletion = async (code: string) => {
    setDeletionError(null)
    setIsDeleting(true)
    try {
      await authService.confirmAccountDeletion(code)
      setDeletionSuccess('Tu cuenta fue dada de baja correctamente.')
      setDeletionStep('confirm')
      setDeletionCode('')
      useAuthStore.getState().logout()
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const apiError = err as { message?: string }
      setDeletionError(apiError.message || 'Código inválido o vencido.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResendDeletionCode = async () => {
    if (isDeletionResending || (deletionTimeLeft ?? 0) > 0) return

    setDeletionError(null)
    setIsDeletionResending(true)
    setDeletionCode('')
    try {
      const response = await authService.requestAccountDeletion()
      setDeletionTimeLeft((response.expiresInMinutes ?? 0) * 60)
      setIsDeletionCodeExpired(false)
    } catch (err) {
      const apiError = err as { message?: string }
      setDeletionError(apiError.message || 'Error al reenviar el código.')
    } finally {
      setIsDeletionResending(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-nepsBg">
        <div className="text-nepsText">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Seguridad y Cuenta</h1>
        <p className="text-xs text-nepsMuted">Administrá tus credenciales y preferencias de acceso.</p>
      </div>

      <section className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 shadow-glow-blue space-y-6">
        <div className="border-b border-nepsBorder/60 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-nepsPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Cambiar Contraseña
          </h2>
        </div>

        {error && (
          <div className="bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent text-xs rounded-lg p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs rounded-lg p-3">
            {success}
          </div>
        )}

        {step === 'request' && (
          <div className="space-y-4">
            <p className="text-xs text-nepsMuted leading-relaxed">
              Para garantizar la seguridad de tu cuenta, te enviaremos un código de validación de 6 dígitos a tu correo electrónico registrado antes de proceder con el cambio.
            </p>
            <button
              type="button"
              onClick={handleRequestCode}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-nepsPrimary hover:bg-sky-300 text-nepsBg font-bold text-xs rounded-lg transition-all active:scale-95 shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Cambiar contraseña'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <p className="text-xs text-nepsMuted">
              {changePasswordTimeLeft !== null && changePasswordTimeLeft > 0
                ? `El código vence en ${formatTime(changePasswordTimeLeft)}.`
                : 'El código ha expirado.'}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(changePasswordCode); }} className="space-y-4">
              <OtpInputs
                value={changePasswordCode}
                onChange={(val) => setChangePasswordCode(val)}
                disabled={isSubmitting}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isChangePasswordCodeExpired || changePasswordCode.length !== 6}
                  className="flex-1 px-5 py-2.5 bg-nepsPrimary hover:bg-sky-300 text-nepsBg font-bold text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verificando...' : 'Aceptar'}
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || (changePasswordTimeLeft ?? 0) > 0}
                  className="px-5 py-2.5 border border-nepsBorder text-nepsText font-medium text-xs rounded-lg hover:bg-nepsInput transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending
                    ? 'Reenviando...'
                    : (changePasswordTimeLeft ?? 0) > 0
                      ? `Reenviar (${formatTime(changePasswordTimeLeft ?? 0)})`
                      : 'Reenviar código'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'reset' && (
          <form onSubmit={handleSubmit(onSubmitReset)} className="space-y-4 max-w-md">
            <PasswordInput
              label="Nueva contraseña"
              type="password"
              placeholder="••••••••"
              {...register('newPassword')}
              showRules
              rules={passwordRules}
            />
            {errors.newPassword && <p className="text-xs text-nepsAccent">{errors.newPassword.message}</p>}

            <PasswordInput
              label="Repetir nueva contraseña"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-xs text-nepsAccent">{errors.confirmPassword.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !allRulesValid}
              className="px-5 py-2.5 bg-nepsPrimary hover:bg-sky-300 text-nepsBg font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar cambio'}
            </button>
          </form>
        )}
      </section>

      <section className="bg-nepsCard border border-nepsAccent/30 rounded-2xl p-6 shadow-glow-pink space-y-6">
        <div className="border-b border-nepsBorder/60 pb-4">
          <h2 className="text-base font-bold text-nepsAccent flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Sesiones activas
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-nepsInput/50 border border-nepsBorder/60 rounded-xl p-4 space-y-3 text-xs text-nepsMuted">
            <p>
              Podés cerrar únicamente la sesión actual del Dashboard desde el menú de usuario, sin afectar otras sesiones activas.
            </p>
            <p>
              Si necesitás revocar el acceso desde otros dispositivos o aplicaciones, podés cerrar todas las sesiones activas de tu cuenta.
            </p>
          </div>

          {logoutAllError && (
            <div className="bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent text-xs rounded-lg p-3">
              {logoutAllError}
            </div>
          )}

          {logoutAllSuccess && (
            <div className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs rounded-lg p-3">
              {logoutAllSuccess}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={isLogoutAllSubmitting}
              className="px-5 py-2.5 bg-nepsAccent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogoutAllSubmitting ? 'Cerrando sesiones...' : 'Cerrar todas las sesiones'}
            </button>
          </div>

          {showLogoutAllConfirm && (
            <div className="bg-nepsInput border border-nepsBorder rounded-xl p-4 space-y-3">
              <p className="text-xs text-nepsText font-semibold">
                ¿Estás seguro de que querés cerrar todas las sesiones?
              </p>
              <p className="text-[11px] text-nepsMuted">
                Esta acción invalidará todas las sesiones activas, incluyendo esta. Los demás dispositivos deberán volver a autenticarse.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={confirmLogoutAll}
                  disabled={isLogoutAllSubmitting}
                  className="flex-1 px-5 py-2.5 bg-nepsAccent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLogoutAllSubmitting ? 'Cerrando...' : 'Sí, cerrar todas las sesiones'}
                </button>
                <button
                  type="button"
                  onClick={cancelLogoutAll}
                  disabled={isLogoutAllSubmitting}
                  className="flex-1 px-5 py-2.5 border border-nepsBorder text-nepsText font-medium text-xs rounded-lg hover:bg-nepsInput transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-nepsCard border border-nepsAccent/30 rounded-2xl p-6 shadow-glow-pink space-y-6">
        <div className="border-b border-nepsBorder/60 pb-4">
          <h2 className="text-base font-bold text-nepsAccent flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862c-1.54 0-2.502-1.667-1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Zona peligrosa
          </h2>
        </div>

        {deletionError && (
          <div className="bg-nepsAccent/10 border border-nepsAccent/20 text-nepsAccent text-xs rounded-lg p-3">
            {deletionError}
          </div>
        )}

        {deletionSuccess && (
          <div className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs rounded-lg p-3">
            {deletionSuccess}
          </div>
        )}

        {deletionStep === 'idle' && (
          <div className="space-y-4">
            <div className="bg-nepsInput/50 border border-nepsBorder/60 rounded-xl p-4 space-y-3 text-xs text-nepsMuted">
              <p>
                Si eliminás la cuenta no podrás volver a loguearte con este usuario.
              </p>
              <p>
                El correo vuelve a quedar disponible para registrarse nuevamente cuando quieras, pero perderás todos los datos de tus lecturas actuales.
              </p>
              <p>
                Se enviará un código a tu correo para confirmar la operación.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestDeletionCode}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-nepsAccent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Enviando...' : 'Dar de baja la cuenta'}
            </button>
          </div>
        )}

        {deletionStep === 'code' && (
          <div className="space-y-4">
            <p className="text-xs text-nepsMuted">
              {deletionTimeLeft !== null && deletionTimeLeft > 0
                ? `Tenés ${formatTime(deletionTimeLeft)} para confirmar la baja de tu cuenta.`
                : 'El código ha expirado.'}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmDeletion(deletionCode); }} className="space-y-4">
              <OtpInputs
                value={deletionCode}
                onChange={(val) => setDeletionCode(val)}
                disabled={isDeleting}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isDeleting || deletionCode.length !== 6 || isDeletionCodeExpired}
                  className="flex-1 px-5 py-2.5 bg-nepsAccent hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Eliminando...' : 'Confirmar baja'}
                </button>
                <button
                  type="button"
                  onClick={handleResendDeletionCode}
                  disabled={isDeletionResending || (deletionTimeLeft ?? 0) > 0}
                  className="px-5 py-2.5 border border-nepsBorder text-nepsText font-medium text-xs rounded-lg hover:bg-nepsInput transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletionResending
                    ? 'Reenviando...'
                    : (deletionTimeLeft ?? 0) > 0
                      ? `Reenviar (${formatTime(deletionTimeLeft ?? 0)})`
                      : 'Reenviar código'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  )
}

export default SettingsPage
