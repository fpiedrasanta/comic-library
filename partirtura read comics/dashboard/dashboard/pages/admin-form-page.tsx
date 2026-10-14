import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { createAdmin, updateAdmin, getAdminById } from '../features/users/services/admin.service'
import { getCountries } from '../features/users/services/country.service'
import CountrySearchSelect from '../features/users/components/country-search-select'
import type { AdminUserListItem } from '@/types/auth'

type AdminMode = 'create' | 'edit'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

const adminSchema = z
  .object({
    firstName: z.string().min(1, 'El nombre es obligatorio.'),
    lastName: z.string().min(1, 'El apellido es obligatorio.'),
    email: z.string().min(1, 'El correo electrónico es obligatorio.').email('Ingrese una dirección de correo válida.'),
    countryId: z.coerce.number().min(1, 'Debe seleccionar un país de la lista.'),
    password: z
      .string()
      .optional()
      .refine((val) => !val || passwordRegex.test(val), {
        message: 'Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.',
      }),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.confirmPassword && data.confirmPassword.length > 0
      }
      return true
    },
    {
      message: 'Debe confirmar la contraseña.',
      path: ['confirmPassword'],
    }
  )

type AdminFormData = z.infer<typeof adminSchema>

function AdminFormPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const mode: AdminMode = id ? 'edit' : 'create'

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageDeleted, setImageDeleted] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [existingImageId, setExistingImageId] = useState<number | undefined>(undefined)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = mode === 'edit' ? 'Dashboard &gt; Gestionar administradores &gt; Editar' : 'Dashboard &gt; Gestionar administradores &gt; Crear'
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [mode])

  const [existingAdmin, setExistingAdmin] = useState<AdminUserListItem | null>(null)

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: () => getCountries({ currentPage: 1, pageSize: 50 }),
  })

  const countries = countriesData?.items ?? []

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryId: 0,
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (mode === 'edit' && id) {
      setIsLoadingAdmin(true)
      setLoadError(null)
      setExistingAdmin(null)

      const adminId = Number(id)

      if (!adminId) {
        setLoadError('ID de administrador no válido.')
        setIsLoadingAdmin(false)
        return
      }

      let isCancelled = false

        getAdminById(adminId)
          .then((admin) => {
            if (!isCancelled) {
              setExistingAdmin(admin)
              setAvatarPreview(admin.avatarUrl)
              setImageDeleted(false)

              const imageIdMatch = admin.avatarUrl?.match(/\/images\/(\d+)/)
              const imageId = imageIdMatch ? Number(imageIdMatch[1]) : undefined
              setExistingImageId(imageId)

              const country = countries.find((c) => c.name === admin.countryName)
              const countryId = country?.id ?? 0

              reset({
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                countryId,
                password: '',
                confirmPassword: '',
              })
            }
          })
        .catch((err) => {
          if (!isCancelled) {
            setLoadError(err instanceof Error ? err.message : 'Error al cargar el administrador.')
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingAdmin(false)
          }
        })

      return () => {
        isCancelled = true
      }
    }
  }, [mode, id, reset, countries])

  const fullName = useMemo(() => {
    const firstName = watch('firstName')
    const lastName = watch('lastName')
    return `${firstName || ''} ${lastName || ''}`.trim()
  }, [watch])

  useEffect(() => {
    if (mode === 'create') {
      setPageTitle('Gestión de Administradores')
      setPageActions(
        <>
          <button
            type="button"
            onClick={() => navigate('/admins')}
            className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:block">Volver al Listado</span>
          </button>
          <span className="text-[11px] text-nepsPrimary bg-nepsPrimary/10 px-2.5 py-1 rounded-md border border-nepsPrimary/20 font-semibold uppercase tracking-wider">
            Modo Creación
          </span>
        </>
      )
    } else {
      setPageTitle('Gestión de Administradores')
      setPageActions(
        <>
          <button
            type="button"
            onClick={() => navigate('/admins')}
            className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:block">Volver al Listado</span>
          </button>
          <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 font-semibold uppercase tracking-wider">
            Modo Edición
          </span>
        </>
      )
    }
  }, [mode, setPageTitle, setPageActions, navigate, id])

  const onSubmit = () => {
    setServerError(null)
    setIsConfirmOpen(true)
  }

  const handleConfirmSave = useCallback(async () => {
    setIsConfirmOpen(false)
    setIsSaving(true)
    setServerError(null)

    try {
      const data = watch()

      const formData = new FormData()
      formData.append('firstName', data.firstName.trim())
      formData.append('lastName', data.lastName.trim())
      formData.append('email', data.email.trim())
      formData.append('countryId', String(data.countryId))

      if (data.password && data.password.length > 0) {
        formData.append('password', data.password)
      }

      if (mode === 'create') {
        if (imageFile) {
          formData.append('avatar', imageFile)
        }
        await createAdmin(formData)
        setSuccessMessage('Administrador creado')
        await queryClient.invalidateQueries({ queryKey: ['admins'] })
      } else if (mode === 'edit' && existingAdmin) {
        if (imageFile) {
          formData.append('avatar', imageFile)
        } else if (!imageDeleted && existingImageId) {
          formData.append('imageId', String(existingImageId))
        } else {
          formData.append('imageId', '0')
        }
        await updateAdmin(existingAdmin.id, formData)
        setSuccessMessage('Administrador actualizado')
        await queryClient.invalidateQueries({ queryKey: ['admins'] })
      }

      setTimeout(() => {
        navigate('/admins')
      }, 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar el administrador.')
    } finally {
      setIsSaving(false)
    }
  }, [mode, existingAdmin, watch, navigate, queryClient, imageFile, imageDeleted])

  const handleCancel = () => {
    navigate('/admins')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Archivo no válido. Solo se permiten imágenes.')
      return
    }

    setImageError(null)
    setImageFile(file)
    setImageDeleted(false)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = () => {
    setAvatarPreview(null)
    setImageFile(null)
    setImageDeleted(true)
    setExistingImageId(undefined)
  }

  if (mode === 'edit' && isLoadingAdmin) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-8 text-center">
          <div className="text-xs text-nepsMuted">Cargando datos del administrador...</div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {mode === 'create' ? 'Nuevo Usuario Administrador' : 'Modificación de Administrador'}
          </h2>
          <p className="text-xs text-nepsMuted mt-0.5">
            {mode === 'create'
              ? 'Complete la información requerida para otorgar acceso administrativo a la plataforma.'
              : 'Modifique los datos del administrador.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-nepsInput border border-nepsBorder px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300" title="El rol asignado es inmutable">
            <svg className="w-3.5 h-3.5 text-nepsPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Rol: <strong className="text-white">Administrator</strong></span>
          </div>

          {mode === 'edit' && existingAdmin && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Cuenta Activa</span>
            </div>
          )}
        </div>
      </div>

      {serverError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-nepsAccent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-nepsAccent">Error al guardar los datos</p>
              <p className="text-nepsMuted">{serverError}</p>
            </div>
          </div>
          <button type="button" onClick={() => setServerError(null)} className="text-nepsMuted hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 sm:p-7 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-white block">Avatar de la Cuenta</label>
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatarPreview ? (
                <ProtectedImage
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-2xl object-cover bg-nepsInput border border-nepsBorder group-hover:border-nepsPrimary transition-colors"
                  fallback={
                    <div className="w-20 h-20 rounded-2xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-xs">
                      Sin imagen
                    </div>
                  }
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-xs">
                  Sin imagen
                </div>
              )}
              <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <label className="cursor-pointer p-2 bg-nepsCard/80 rounded-xl border border-nepsBorder hover:border-nepsPrimary transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="px-3 py-1.5 bg-nepsInput hover:bg-nepsBorder text-white border border-nepsBorder font-semibold rounded-lg text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {avatarPreview ? 'Reemplazar imagen' : 'Subir imagen'}
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="block text-[11px] text-nepsAccent hover:text-nepsAccent/80 transition-colors"
                >
                  Eliminar imagen
                </button>
              )}
              <p className="text-[11px] text-nepsMuted">Recomendado: JPG o PNG de al menos 400x400px.</p>
            </div>
          </div>
          {imageFile && <p className="text-[10px] text-nepsMuted truncate">{imageFile.name}</p>}
          {imageError && <p className="text-[11px] text-nepsAccent">{imageError}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-xs font-bold text-white flex items-center gap-1">
              Nombre <span className="text-nepsAccent">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              {...register('firstName')}
              placeholder="Ej. Ignacio"
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {errors.firstName && <p className="text-[11px] text-nepsAccent">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-xs font-bold text-white flex items-center gap-1">
              Apellido <span className="text-nepsAccent">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              {...register('lastName')}
              placeholder="Ej. Rossi"
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {errors.lastName && <p className="text-[11px] text-nepsAccent">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-white flex items-center gap-1">
              Correo Electrónico <span className="text-nepsAccent">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              placeholder="ejemplo@neps.io"
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {errors.email && <p className="text-[11px] text-nepsAccent">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <CountrySearchSelect
              label="País"
              value={watch('countryId') ? String(watch('countryId')) : undefined}
              onChange={(val) => setValue('countryId', Number(val))}
              initialSelectedName={mode === 'edit' && existingAdmin ? existingAdmin.countryName ?? undefined : undefined}
              error={errors.countryId?.message}
            />
          </div>
        </div>

        {mode === 'create' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-nepsBorder/60 pt-5">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-white flex items-center gap-1">
                Contraseña <span className="text-nepsAccent">*</span>
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                placeholder="••••••••••••"
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              />
              <p className="text-[11px] text-nepsMuted">Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo.</p>
              {errors.password && <p className="text-[11px] text-nepsAccent">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-white flex items-center gap-1">
                Confirmar Contraseña <span className="text-nepsAccent">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
                placeholder="••••••••••••"
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              />
              {errors.confirmPassword && <p className="text-[11px] text-nepsAccent">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        )}

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
            className="w-full sm:w-auto px-6 py-2.5 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-nepsPrimary/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{mode === 'create' ? 'Guardar Administrador' : 'Guardar Cambios'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsPrimary/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center flex-shrink-0 border border-nepsPrimary/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {mode === 'create'
                    ? `¿Estás seguro que deseas crear al administrador ${fullName || '...'}?`
                    : `¿Estás seguro que deseas guardar los cambios de ${fullName || '...'}?`}
                </h3>
                <p className="text-xs text-nepsMuted mt-1">Revise la información del usuario antes de confirmar la operación.</p>
              </div>
            </div>

            <div className="bg-nepsInput border border-nepsBorder rounded-xl p-3 text-xs space-y-1">
              <p className="text-nepsMuted">Nombre completo: <strong className="text-white">{fullName || '—'}</strong></p>
              <p className="text-nepsMuted">Correo electrónico: <strong className="text-white">{watch('email') || '—'}</strong></p>
              <p className="text-nepsMuted">Rol asignado: <strong className="text-nepsPrimary font-bold">Administrator</strong></p>
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
                className="px-5 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                <span>Confirmar y Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-5 right-5 bg-nepsCard border border-emerald-500/40 rounded-xl p-4 shadow-2xl flex items-center gap-3 z-50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white">{successMessage}</p>
            <p className="text-[10px] text-nepsMuted">Los cambios se guardaron correctamente.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminFormPage

