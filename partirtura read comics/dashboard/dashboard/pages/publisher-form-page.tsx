import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { getPublisher, createPublisher, updatePublisher } from '../features/publishers/services/publisher.service'
import CountrySearchSelect from '../features/users/components/country-search-select'
import { ProtectedImage } from '../components/protected-image'
import type { AdminPublisherDetailDto } from '../types/publisher'

const PRESET_COLORS = [
  '#ED1C24',
  '#FF6B00',
  '#FFD700',
  '#38BDF8',
  '#00FF94',
  '#A855F7',
  '#EC4899',
  '#FFFFFF',
  '#94A3B8',
  '#000000',
] as const

type PublisherMode = 'create' | 'edit'

const publisherSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  countryId: z.coerce.number().min(1, 'Debe seleccionar un país de la lista.'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hexadecimal inválido (ej: #FF5733).').optional().or(z.literal('')),
  description: z.string().max(300, 'Máximo 300 caracteres.').optional().or(z.literal('')),
  website: z.string().url('Ingrese una URL válida.').optional().or(z.literal('')),
  foundedYear: z.coerce.number().min(800, 'Año fuera de rango (800 - 2026).').max(2026, 'Año fuera de rango (800 - 2026).').optional().or(z.literal('')),
  history: z.string().optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  isAlive: z.boolean().optional(),
})

type PublisherFormData = z.infer<typeof publisherSchema>

function PublisherFormPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const mode: PublisherMode = id ? 'edit' : 'create'

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [existingImageId, setExistingImageId] = useState<number | undefined>(undefined)
  const [imageDeleted, setImageDeleted] = useState(false)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const previousIdRef = useRef<string | undefined>(undefined)
  const appliedPublisherRef = useRef<string | null>(null)

  useEffect(() => {
    if (previousIdRef.current !== undefined && previousIdRef.current !== id) {
      setImagePreview(null)
      setImageFile(null)
      setImageDeleted(false)
      setImageError(null)
      setExistingImageId(undefined)
      setServerError(null)
      setSuccessMessage('')
      setIsConfirmOpen(false)
    }

    previousIdRef.current = id
  }, [id])

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = mode === 'edit' ? 'Dashboard &gt; Gestionar editoriales &gt; Editar' : 'Dashboard &gt; Gestionar editoriales &gt; Nuevo'
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [mode])

  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PublisherFormData>({
    resolver: zodResolver(publisherSchema),
    defaultValues: {
      name: '',
      countryId: 0,
      color: '',
      description: '',
      website: '',
      foundedYear: '',
      history: '',
      isFeatured: false,
      isAlive: true,
    },
  })

  const watchColor = watch('color')

  const { data: publisherData, isLoading: isLoadingPublisherData, error: publisherError } = useQuery({
    queryKey: ['publisher', id],
    queryFn: () => getPublisher(Number(id)),
    enabled: mode === 'edit' && !!id,
  })

  useEffect(() => {
    if (mode === 'edit' && publisherData && appliedPublisherRef.current !== id) {
      appliedPublisherRef.current = id ?? null
      const detail = publisherData as AdminPublisherDetailDto
      setExistingImageId(detail.imageId)
      setImageDeleted(false)
      setSelectedCountryName(detail.countryName)

      reset({
        name: detail.name,
        countryId: detail.countryId,
        color: detail.color || '',
        description: detail.description || '',
        website: detail.website || '',
        foundedYear: detail.foundedYear || '',
        history: detail.history || '',
        isFeatured: detail.isFeatured,
        isAlive: detail.isAlive,
      })

      if (detail.urlImage) {
        setImagePreview(detail.urlImage)
      } else {
        setImagePreview(null)
      }
    }
  }, [mode, publisherData, id, reset])

  useEffect(() => {
    if (mode === 'create') {
      setPageTitle('Gestión de Editoriales')
      setPageActions(
        <>
          <button
            onClick={() => navigate('/publishers')}
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
      setPageTitle('Gestión de Editoriales')
      setPageActions(
        <>
          <button
            onClick={() => navigate('/publishers')}
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
  }, [mode, setPageTitle, setPageActions, navigate])

  const fullName = useMemo(() => watch('name'), [watch])

  const onSubmit = () => {
    setServerError(null)
    setIsConfirmOpen(true)
  }

  const handleConfirmSave = useCallback(async () => {
    setIsConfirmOpen(false)
    setIsSaving(true)
    setServerError(null)

    try {
      const values = watch()
      const formData = new FormData()

      formData.append('name', values.name)
      formData.append('description', values.description || '')
      formData.append('website', values.website || '')
      formData.append('countryId', String(values.countryId))
      formData.append('foundedYear', values.foundedYear ? String(Number(values.foundedYear)) : '')
      formData.append('history', values.history || '')
      formData.append('isAlive', String(values.isAlive ?? true))
      formData.append('isFeatured', String(values.isFeatured ?? false))

      if (values.color) {
        formData.append('color', values.color)
      }

      if (mode === 'edit') {
        if (imageFile) {
          formData.append('avatar', imageFile)
          formData.append('imageId', '0')
        } else if (!imageDeleted && existingImageId) {
          formData.append('imageId', String(existingImageId))
        } else {
          formData.append('imageId', '0')
        }
      }

      if (mode === 'create') {
        if (imageFile) {
          formData.append('avatar', imageFile)
        }
        await createPublisher(formData)
        setSuccessMessage('Editorial creada')
      } else {
        await updatePublisher(Number(id), formData)
        setSuccessMessage('Editorial actualizada')
      }

      setTimeout(() => {
        navigate('/publishers')
      }, 1500)
      await queryClient.invalidateQueries({ queryKey: ['publishers'] })
      if (mode === 'edit' && id) {
        await queryClient.invalidateQueries({ queryKey: ['publisher', id] })
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar la editorial.')
    } finally {
      setIsSaving(false)
    }
  }, [mode, navigate, queryClient, id, watch, existingImageId, imageDeleted, imageFile])

  const handleCancel = () => {
    navigate('/publishers')
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
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = () => {
    setImagePreview(null)
    setImageFile(null)
    setImageDeleted(true)
    setExistingImageId(undefined)
  }

  if (mode === 'edit' && isLoadingPublisherData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-8 text-center">
          <div className="text-xs text-nepsMuted">Cargando datos de la editorial...</div>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && publisherError) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {publisherError instanceof Error ? publisherError.message : 'Error al cargar la editorial.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-nepsBorder/60 pb-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {mode === 'create' ? 'Formulario de Editorial' : 'Modificación de Editorial Existente'}
        </h2>
        <p className="text-xs text-nepsMuted mt-0.5">
          {mode === 'create'
            ? 'Complete la información general, imagen corporativa y configuración de catálogo.'
            : 'Modifique los datos de la editorial.'}
        </p>
      </div>

      {serverError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-xl p-4 flex items-start justify-between gap-3">
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

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Imagen Representativa</label>
              <span className="text-[10px] text-nepsMuted bg-nepsInput px-2 py-0.5 rounded border border-nepsBorder">WebP Target</span>
            </div>
            <p className="text-[11px] text-nepsMuted">Permite únicamente una imagen por editorial.</p>

            {!imagePreview ? (
              <label className="border-2 border-dashed border-nepsBorder hover:border-nepsPrimary/60 bg-nepsInput/50 hover:bg-nepsInput rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white">Arrastrá tu imagen acá</p>
                <p className="text-[10px] text-nepsMuted mt-0.5">o hacé clic para explorar</p>
              </label>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-nepsBorder bg-nepsInput">
                {imagePreview && !imagePreview.startsWith('data:') && !imagePreview.startsWith('http') ? (
                  <ProtectedImage
                    src={imagePreview}
                    alt="Preview Editorial"
                    className="w-full h-44 object-contain p-2"
                    fallback={
                      <div className="w-full h-44 flex items-center justify-center text-nepsMuted text-xs">
                        Error al cargar imagen
                      </div>
                    }
                  />
                ) : (
                  <img src={imagePreview || ''} alt="Preview Editorial" className="w-full h-44 object-contain p-2" />
                )}
                <div className="absolute inset-0 bg-nepsBg/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="p-2 bg-nepsCard text-white border border-nepsBorder rounded-lg hover:border-nepsPrimary transition-colors cursor-pointer" title="Reemplazar imagen">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </label>
                  <button type="button" onClick={handleDeleteImage} className="p-2 bg-nepsAccent/20 text-nepsAccent border border-nepsAccent/30 rounded-lg hover:bg-nepsAccent hover:text-white transition-colors" title="Eliminar imagen">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {imageFile && <p className="text-[10px] text-nepsMuted mt-1 truncate">{imageFile.name}</p>}

            {imageError && <p className="text-[11px] text-nepsAccent">{imageError}</p>}
          </div>

          <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Color Representativo</label>
              <button type="button" onClick={() => reset({ ...watch(), color: '' })} className="text-[11px] text-nepsMuted hover:text-nepsAccent transition-colors">
                Sin color
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative w-10 h-10 rounded-xl border border-nepsBorder flex-shrink-0 overflow-hidden bg-nepsInput flex items-center justify-center cursor-pointer group">
                <input
                  type="color"
                  value={watchColor || '#000000'}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                {watchColor && watchColor.length === 7 ? (
                  <div className="w-full h-full" style={{ backgroundColor: watchColor }}></div>
                ) : (
                  <svg className="w-4 h-4 text-nepsMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </label>

              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nepsMuted text-xs font-mono">#</span>
                <input
                  type="text"
                  value={watchColor ?? ''}
                  onChange={(e) => setValue('color', e.target.value, { shouldValidate: true, shouldDirty: true })}
                  placeholder="38BDF8"
                  maxLength={7}
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white font-mono rounded-xl pl-7 pr-3 py-2.5 outline-none transition-colors uppercase"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue('color', preset)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${
                    watchColor === preset ? 'border-white scale-110' : 'border-nepsBorder hover:border-nepsMuted'
                  }`}
                  style={{ backgroundColor: preset }}
                  title={preset}
                />
              ))}
            </div>

            {errors.color && <p className="text-[11px] text-nepsAccent">{errors.color.message}</p>}
          </div>

          <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label htmlFor="isFeaturedSwitch" className="text-xs font-bold text-white block">Editorial Destacada</label>
                <p className="text-[11px] text-nepsMuted mt-0.5">Resaltar en secciones principales.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" {...register('isFeatured')} className="sr-only peer" />
                <div className="w-9 h-5 bg-nepsInput border border-nepsBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-nepsMuted after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nepsPrimary/20 peer-checked:border-nepsPrimary/40 peer-checked:after:bg-nepsPrimary"></div>
              </label>
            </div>

            <div className="h-px bg-nepsBorder/60"></div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <label htmlFor="isAliveSwitch" className="text-xs font-bold text-white block">¿En Operación / Existente?</label>
                <p className="text-[11px] text-nepsMuted mt-0.5">Indica existencia histórica. No afecta visibilidad en catálogo.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" {...register('isAlive')} className="sr-only peer" />
                <div className="w-9 h-5 bg-nepsInput border border-nepsBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-nepsMuted after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/40 peer-checked:after:bg-emerald-400"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 sm:p-7 space-y-5 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="name" className="text-xs font-bold text-white flex items-center gap-1">
                  Nombre de la Editorial <span className="text-nepsAccent">*</span>
                </label>
                <span className="text-[10px] text-nepsMuted">máx. 150 caracteres</span>
              </div>
              <input
                type="text"
                id="name"
                {...register('name')}
                maxLength={150}
                placeholder="Ej: Editorial Sudamericana"
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              />
              {errors.name && <p className="text-[11px] text-nepsAccent">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Controller
                  name="countryId"
                  control={control}
                  render={({ field }) => (
                    <CountrySearchSelect
                      label="País"
                      value={field.value ? String(field.value) : undefined}
                      onChange={(val) => field.onChange(Number(val))}
                      initialSelectedName={mode === 'edit' && publisherData ? publisherData.countryName : undefined}
                      onSelectionChange={setSelectedCountryName}
                      error={errors.countryId?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="foundedYear" className="text-xs font-bold text-white">
                  Año de Fundación
                </label>
                <input
                  type="number"
                  id="foundedYear"
                  {...register('foundedYear')}
                  min={800}
                  max={2026}
                  placeholder="Ej: 1945"
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                />
                {errors.foundedYear && <p className="text-[11px] text-nepsAccent">{errors.foundedYear.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="website" className="text-xs font-bold text-white">
                Sitio Web
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nepsMuted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </span>
                <input
                  type="url"
                  id="website"
                  {...register('website')}
                  placeholder="https://www.editorialejemplo.com"
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition-colors"
                />
              </div>
              {errors.website && <p className="text-[11px] text-nepsAccent">{errors.website.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="description" className="text-xs font-bold text-white">
                  Descripción Breve
                </label>
                <span className="text-[10px] text-nepsMuted">máx. 300 caracteres</span>
              </div>
              <textarea
                id="description"
                rows={2}
                maxLength={300}
                {...register('description')}
                placeholder="Resumen institucional o línea editorial..."
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl p-3.5 outline-none transition-colors resize-y"
              />
              {errors.description && <p className="text-[11px] text-nepsAccent">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="history" className="text-xs font-bold text-white">
                Historia
              </label>
              <textarea
                id="history"
                rows={5}
                {...register('history')}
                placeholder="Reseña histórica, orígenes y trayectoria..."
                className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl p-3.5 outline-none transition-colors resize-y min-h-[120px]"
              />
            </div>
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
                  <span>{mode === 'create' ? 'Guardar Editorial' : 'Guardar Cambios'}</span>
                </>
              )}
            </button>
          </div>
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
                    ? `¿Estás seguro que deseas crear la editorial ${fullName || '...'}?`
                    : `¿Estás seguro que deseas guardar los cambios de ${fullName || '...'}?`}
                </h3>
                <p className="text-xs text-nepsMuted mt-1">Revise la información antes de confirmar la operación.</p>
              </div>
            </div>

            <div className="bg-nepsInput border border-nepsBorder rounded-xl p-3 text-xs space-y-1">
              <p className="text-nepsMuted">Nombre: <strong className="text-white">{fullName || '—'}</strong></p>
              <p className="text-nepsMuted">País: <strong className="text-white">{selectedCountryName ?? '—'}</strong></p>
              {mode === 'edit' && id && <p className="text-nepsMuted">ID Editorial: <strong className="text-white">{id}</strong></p>}
              {imageFile && <p className="text-nepsMuted">Imagen: <strong className="text-white">{imageFile.name}</strong></p>}
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

export default PublisherFormPage

