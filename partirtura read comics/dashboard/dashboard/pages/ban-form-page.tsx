import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import moment from 'moment'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { formatDate } from '@/lib/date-utils'
import { createBan, updateBan, getBanById } from '../features/bans/services/ban.service'
import type { Ban } from '../types/ban'
import type { UserListItem } from '../types/auth'

type BanMode = 'create' | 'edit'

interface LocationState {
  selectedUser?: UserListItem
  ban?: Ban
}

const banSchema = z.object({
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria.'),
  endDate: z.string().optional(),
  reason: z.string().min(1, 'El motivo es obligatorio.'),
})

type BanFormData = z.infer<typeof banSchema>

function BanFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const locationState = location.state as LocationState | null
  const path = location.pathname

  const mode: BanMode = path.includes('/edit') ? 'edit' : 'create'

  const selectedUser = locationState?.selectedUser || null

  const [existingBan, setExistingBan] = useState<Ban | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoadingBan, setIsLoadingBan] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const user = useMemo(() => {
    if (mode === 'create' && selectedUser) {
      return selectedUser
    }
    if (mode === 'edit' && existingBan) {
      return {
        id: existingBan.userId,
        firstName: existingBan.firstName,
        lastName: existingBan.lastName,
        email: existingBan.email,
        avatarUrl: existingBan.avatarUrl,
        countryName: null,
        createdAt: existingBan.createdAt,
        banCount: 0,
        isActive: true,
        isBanned: false,
      }
    }
    return null
  }, [mode, selectedUser, existingBan])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<BanFormData>({
    resolver: zodResolver(banSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')
  const watchedReason = watch('reason')

  useEffect(() => {
    if (mode === 'create') {
      setPageTitle('Crear Baneo')
      setPageActions(
        <>
          <button
            onClick={() => navigate('/bans/select-user')}
            className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:block">Cambiar Usuario</span>
          </button>
          <span className="text-[11px] text-nepsAccent bg-nepsAccent/10 px-2.5 py-1 rounded-md border border-nepsAccent/20 font-semibold uppercase tracking-wider">
            Modo Creación
          </span>
        </>
      )
      setValue('startDate', moment().format('YYYY-MM-DDTHH:mm'))
    } else {
      setPageTitle('Editar Baneo')
      setPageActions(
        <>
          <button
            onClick={() => navigate('/bans')}
            className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:block">Volver a Baneos</span>
          </button>
          <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold uppercase tracking-wider">
            Modo Edición
          </span>
        </>
      )
    }
  }, [mode, setPageTitle, setPageActions, navigate, setValue])

  useEffect(() => {
    if (mode === 'edit') {
      setIsLoadingBan(true)
      setLoadError(null)

      const idMatch = path.match(/\/bans\/(\d+)\/edit/)
      const banId = idMatch ? Number(idMatch[1]) : null

      if (!banId) {
        setLoadError('ID de baneo no válido.')
        setIsLoadingBan(false)
        return
      }

      let isCancelled = false

      getBanById(banId)
        .then((ban) => {
          if (!isCancelled) {
            setExistingBan(ban)
            reset({
              startDate: moment.utc(ban.startDate).local().format('YYYY-MM-DDTHH:mm'),
              endDate: ban.endDate ? moment.utc(ban.endDate).local().format('YYYY-MM-DDTHH:mm') : '',
              reason: ban.reason,
            })
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            setLoadError(err instanceof Error ? err.message : 'Error al cargar el baneo.')
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingBan(false)
          }
        })

      return () => {
        isCancelled = true
      }
    }
  }, [mode, path])

  const handleConfirmSave = useCallback(async () => {
    setIsConfirmOpen(false)
    setIsSaving(true)
    setServerError(null)

    try {
      if (mode === 'create' && selectedUser) {
        await createBan({
          userId: selectedUser.id,
          startDate: moment(watchedStartDate).utc().toISOString(),
          endDate: watchedEndDate ? moment(watchedEndDate).utc().toISOString() : null,
          reason: watchedReason,
        })
      } else if (mode === 'edit' && existingBan) {
        await updateBan(existingBan.id, {
          startDate: moment(watchedStartDate).utc().toISOString(),
          endDate: watchedEndDate ? moment(watchedEndDate).utc().toISOString() : null,
          reason: watchedReason,
        })
      }

      setIsSuccess(true)
      setSuccessMessage(mode === 'create' ? 'Baneo guardado' : 'Baneo actualizado')
      setTimeout(() => {
        navigate('/bans')
      }, 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar el baneo.')
    } finally {
      setIsSaving(false)
    }
  }, [mode, selectedUser, existingBan, watchedStartDate, watchedEndDate, watchedReason, navigate])

  const handleCancel = () => {
    navigate('/bans')
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-6 text-center max-w-md mx-auto space-y-2">
          <p className="text-xs font-bold text-nepsAccent">Error al cargar la pantalla</p>
          <p className="text-[11px] text-nepsMuted">
            No se encontró la información del usuario. Por favor, volvé a intentar desde el listado de baneos.
          </p>
          <button
            onClick={() => navigate('/bans')}
            className="mt-2 px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder/50 text-xs font-semibold text-slate-300 rounded-xl transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-bold">{successMessage}</span>
          </div>
          <p className="text-[11px] text-nepsMuted">Redirigiendo al listado...</p>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && isLoadingBan) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-8 text-center">
          <div className="text-xs text-nepsMuted">Cargando datos del baneo...</div>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && loadError) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {loadError}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-nepsBorder/60 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {mode === 'create' ? 'Configuración de Sanción / Baneo' : 'Modificación de Baneo Existente'}
        </h2>
        <p className="text-xs text-nepsMuted mt-0.5">
          {mode === 'create'
            ? 'Establezca los parámetros temporales y el motivo para aplicar la restricción a la cuenta del usuario.'
            : 'Modifique los parámetros del baneo existente.'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-nepsMuted uppercase tracking-wider block">Usuario Seleccionado</label>

        <div className="bg-nepsCard border border-nepsBorder rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <ProtectedImage
              src={user.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-xl object-contain bg-nepsInput border border-nepsBorder flex-shrink-0"
              fallback={
                <div className="w-16 h-16 rounded-xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-xs">
                  Sin imagen
                </div>
              }
            />
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</h3>
              <p className="text-xs text-nepsMuted truncate">{user.email}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-1">
                <span>Nacionalidad: <strong className="text-white">{user.countryName || '—'}</strong></span>
                <span>•</span>
                <span>Registro: <strong className="text-white">{formatDate(user.createdAt)}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-nepsBorder/60 pt-2 sm:pt-0">
            {mode === 'edit' ? (
              <>
                <span className="text-xs text-nepsMuted">Baneos previos: <strong className="text-white font-bold">—</strong></span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  existingBan?.status === 'Active'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-400 bg-slate-500/10 border border-slate-500/20'
                }`}>
                  {existingBan?.status === 'Active' ? 'Activo' : existingBan?.status === 'Revoked' ? 'Revocado' : 'Finalizado'}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-nepsMuted">Baneos previos: <strong className="text-white font-bold">{user.banCount}</strong></span>
                {user.isBanned ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Baneado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Cuenta Activa
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {serverError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(() => {
          if (!isSaving) {
            setIsConfirmOpen(true)
          }
        })}
        className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 sm:p-7 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="startDate" className="text-xs font-bold text-white flex items-center gap-1">
                Fecha Desde <span className="text-nepsAccent">*</span>
              </label>
              <span className="text-[10px] text-nepsMuted font-medium bg-nepsInput px-2 py-0.5 rounded border border-nepsBorder">Hora Local Admin</span>
            </div>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <input
                  type="datetime-local"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-nepsPrimary color-scheme-dark"
                />
              )}
            />
            {errors.startDate && <p className="text-[11px] text-nepsAccent">{errors.startDate.message}</p>}
            <p className="text-[11px] text-nepsMuted">Fecha y hora de inicio de la sanción.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="endDate" className="text-xs font-bold text-white flex items-center gap-1">
                Fecha Hasta
              </label>
              <span className="text-[10px] text-nepsMuted font-medium bg-nepsInput px-2 py-0.5 rounded border border-nepsBorder">Hora Local Admin</span>
            </div>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <input
                  type="datetime-local"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-nepsPrimary color-scheme-dark"
                />
              )}
            />
            {errors.endDate && <p className="text-[11px] text-nepsAccent">{errors.endDate.message}</p>}
            <p className="text-[11px] text-nepsMuted">Dejar vacío si la sanción es de carácter indefinido.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="reason" className="text-xs font-bold text-white">
              Motivo de la Sanción
            </label>
            <span className="text-[11px] text-nepsMuted">Texto libre</span>
          </div>
          <textarea
            id="reason"
            rows={5}
            {...register('reason')}
            placeholder="Describa de manera detallada el motivo del baneo, infracciones a los términos o evidencias relevantes..."
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl p-3.5 outline-none transition-colors resize-y min-h-[110px]"
          />
          {errors.reason && <p className="text-[11px] text-nepsAccent">{errors.reason.message}</p>}
          <p className="text-[11px] text-nepsMuted">Esta información será registrada en el historial del usuario para auditoría administrativa.</p>
        </div>

        <div className="border-t border-nepsBorder/60 pt-5 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-nepsInput hover:bg-nepsBorder text-nepsMuted hover:text-white border border-nepsBorder font-semibold rounded-xl text-xs transition-all disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 bg-nepsAccent hover:bg-rose-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-nepsAccent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{mode === 'create' ? 'Guardar Baneo' : 'Guardar Cambios'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsAccent/10 text-nepsAccent flex items-center justify-center flex-shrink-0 border border-nepsAccent/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {mode === 'create'
                    ? `¿Estás seguro que deseas banear a ${user.firstName} ${user.lastName}?`
                    : `¿Estás seguro que deseas guardar los cambios del baneo de ${user.firstName} ${user.lastName}?`}
                </h3>
                <p className="text-xs text-nepsMuted mt-1">
                  Esta operación {mode === 'create' ? 'creará' : 'modificará'} el registro de baneo del usuario.
                </p>
              </div>
            </div>

            <div className="bg-nepsInput/60 border border-nepsBorder/80 p-3 rounded-xl text-[11px] text-nepsMuted space-y-1">
              <p className="font-semibold text-slate-300">Datos del baneo</p>
              <p>Fecha desde: <strong className="text-white">{watchedStartDate ? moment(watchedStartDate).format('DD/MM/YYYY HH:mm') : '—'}</strong></p>
              <p>Fecha hasta: <strong className="text-white">{watchedEndDate ? moment(watchedEndDate).format('DD/MM/YYYY HH:mm') : 'Permanente'}</strong></p>
              <p>Motivo: <strong className="text-white">{watchedReason || '—'}</strong></p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder/50 text-xs font-semibold text-slate-300 rounded-xl transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsAccent hover:bg-rose-600 text-xs font-bold text-white rounded-xl shadow-lg shadow-nepsAccent/20 transition-all flex items-center gap-1.5 disabled:opacity-70"
              >
                <span>{mode === 'create' ? 'Confirmar Creación' : 'Confirmar Cambios'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BanFormPage
