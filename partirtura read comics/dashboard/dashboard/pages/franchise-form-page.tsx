import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDashboardPageHeader } from './dashboard-layout'
import { ProtectedImage } from '../components/protected-image'
import { getFranchiseById, createFranchise, updateFranchise } from '../features/franchises/services/franchise.service'
import { getPublisher } from '../features/publishers/services/publisher.service'
import type { FranchiseDetailDto } from '../types/franchise'
import type { AdminPublisherDetailDto } from '@/types/publisher'

type PublisherSelectItem = {
  id: number
  name: string
  countryName: string
  color: string
  urlImage: string
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#ffffff',
  '#64748b',
  '#000000',
] as const

type FranchiseMode = 'create' | 'edit'

const franchiseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  description: z.string().max(500, 'Máximo 500 caracteres.').optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hexadecimal inválido (ej: #FF5733).').optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  isOngoing: z.boolean().optional(),
})

type FranchiseFormData = z.infer<typeof franchiseSchema>

function FranchiseFormPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const mode: FranchiseMode = id ? 'edit' : 'create'

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [existingImageId, setExistingImageId] = useState<number | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherSelectItem | null>(null)

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = mode === 'edit' ? 'Dashboard &gt; Gestionar franquicias &gt; Editar' : 'Dashboard &gt; Gestionar franquicias &gt; Nuevo'
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [mode])

  const resetRef = useRef<typeof reset | null>(null)
  const watchRef = useRef<typeof watch | null>(null)

  const { data: franchiseData, isLoading: isLoadingFranchiseData, error: franchiseError } = useQuery({
    queryKey: ['franchise', id],
    queryFn: () => getFranchiseById(Number(id)),
    enabled: mode === 'edit' && !!id,
  })

  const storageKey = `franchise-form-edit-${id}`
  const valuesKey = `franchise-form-values-${id}`
  const publisherKey = `franchise-form-publisher-${id}`
  const imageKey = `franchise-form-image-${id}`

  const clearSessionStorage = () => {
    sessionStorage.removeItem(storageKey)
    sessionStorage.removeItem(valuesKey)
    sessionStorage.removeItem(publisherKey)
    sessionStorage.removeItem(imageKey)
  }

  const saveFormToSessionStorage = () => {
    const values = watchRef.current?.()
    if (!values) return
    sessionStorage.setItem(valuesKey, JSON.stringify(values))
    sessionStorage.setItem(publisherKey, JSON.stringify(selectedPublisher))
    sessionStorage.setItem(imageKey, JSON.stringify({
      preview: imagePreview,
      existingImageId,
    }))
  }

  useEffect(() => {
    const incoming = location.state?.selectedPublisher || null

    if (incoming) {
      if (mode === 'edit') {
        const savedPublisher = sessionStorage.getItem(publisherKey)
        const savedValues = sessionStorage.getItem(valuesKey)
        const savedImage = sessionStorage.getItem(imageKey)

        if (savedPublisher && savedValues) {
          const publisher = JSON.parse(savedPublisher)
          const values = JSON.parse(savedValues)
          const image = savedImage ? JSON.parse(savedImage) : null

          setSelectedPublisher(publisher)
          resetRef.current?.(values)
          setImagePreview(image?.preview ?? null)
          setExistingImageId(image?.existingImageId)

          getPublisher(publisher.id).then(p => {
            setSelectedPublisher(prev => prev ? {
              ...prev,
              color: p.color,
              urlImage: p.urlImage,
            } : null)
          }).catch(() => {})
        } else {
          setSelectedPublisher(incoming)
        }
      } else {
        setSelectedPublisher(incoming)
      }

      getPublisher(incoming.id).then(p => {
        setSelectedPublisher(prev => prev ? {
          ...prev,
          color: p.color,
          urlImage: p.urlImage,
        } : null)
      }).catch(() => {})

      clearSessionStorage()
      return
    }

    if (mode === 'edit' && id && franchiseData && !sessionStorage.getItem(storageKey)) {
      sessionStorage.setItem(storageKey, 'true')
      const detail = franchiseData as FranchiseDetailDto
      setExistingImageId(detail.imageId)

      setSelectedPublisher({
        id: detail.publisherId,
        name: detail.publisherName,
        countryName: detail.publisherCountryName,
        color: '',
        urlImage: '',
      })

      resetRef.current?.({
        name: detail.name,
        description: detail.description || '',
        color: detail.color || '',
        isFeatured: detail.isFeatured,
        isOngoing: detail.isOngoing,
      })

      if (detail.imageId) {
        setImagePreview(`/images/${detail.imageId}`)
      } else {
        setImagePreview(null)
      }

      const cachedPublisher = queryClient.getQueryData<AdminPublisherDetailDto>(['publisher', detail.publisherId])
      if (cachedPublisher) {
        setSelectedPublisher(prev => prev ? {
          ...prev,
          color: cachedPublisher.color,
          urlImage: cachedPublisher.urlImage,
        } : null)
      } else {
        getPublisher(detail.publisherId).then(publisher => {
          setSelectedPublisher(prev => prev ? {
            ...prev,
            color: publisher.color,
            urlImage: publisher.urlImage,
          } : null)
        }).catch(() => {})
      }
    }
  }, [mode, id, franchiseData, queryClient, storageKey, valuesKey, publisherKey, imageKey, location.key, location.state])

  useEffect(() => {
    if (mode === 'create') {
      setPageTitle('Nueva Franquicia')
      setPageActions(
        <button
          onClick={() => navigate('/franchises/select-publisher')}
          className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span className="hidden sm:block">Cambiar Editorial</span>
        </button>
      )
    } else {
      setPageTitle('Editar Franquicia')
      setPageActions(
        <button
          onClick={() => navigate('/franchises')}
          className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsMuted px-3 py-1.5 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span className="hidden sm:block">Volver al Listado</span>
        </button>
      )
    }
  }, [mode, setPageTitle, setPageActions, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '',
      isFeatured: false,
      isOngoing: true,
    },
  })

  const watchColor = watch('color')

  resetRef.current = reset
  watchRef.current = watch

  const onSubmit = () => {
    setServerError(null)
    setIsConfirmOpen(true)
  }

  const handleConfirmSave = useCallback(async () => {
    setIsConfirmOpen(false)
    setIsSaving(true)
    setServerError(null)

    if (!selectedPublisher) {
      setServerError('Debés seleccionar una editorial antes de guardar.')
      setIsSaving(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', watch('name') || '')
      formData.append('description', watch('description') || '')
      formData.append('publisherId', String(selectedPublisher.id))
      formData.append('isFeatured', String(!!watch('isFeatured')))
      formData.append('isOngoing', String(!!watch('isOngoing')))

      const color = (watch('color') || '').trim()
      if (color) {
        formData.append('color', color)
      }

      if (mode === 'create') {
        if (imageFile) {
          formData.append('avatar', imageFile)
        }
        await createFranchise(formData)
      } else {
        if (id) {
          if (imageFile) {
            formData.append('imageId', '0')
            formData.append('avatar', imageFile)
          } else {
            const imageIdValue = existingImageId ?? 0
            formData.append('imageId', String(imageIdValue))
          }
          await updateFranchise(Number(id), formData)
        }
      }

      setSuccessMessage(mode === 'create' ? 'Franquicia creada' : 'Franquicia actualizada')
      queryClient.invalidateQueries({ queryKey: ['franchises'] })
      queryClient.invalidateQueries({ queryKey: ['franchise', id] })
      clearSessionStorage()
      setTimeout(() => {
        navigate('/franchises')
      }, 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar la franquicia.')
    } finally {
      setIsSaving(false)
    }
  }, [mode, navigate, selectedPublisher, id, existingImageId, imageFile, watch, queryClient])

  const handleCancel = () => {
    clearSessionStorage()
    navigate('/franchises')
  }

  const handleChangePublisher = () => {
    saveFormToSessionStorage()
    navigate('/franchises/select-publisher', { state: { mode, id } })
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
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = () => {
    setImagePreview(null)
    setImageFile(null)
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  if (mode === 'edit' && isLoadingFranchiseData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-8 text-center">
          <div className="text-xs text-nepsMuted">Cargando datos de la franquicia...</div>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && franchiseError) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {franchiseError instanceof Error ? franchiseError.message : 'Error al cargar la franquicia.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-nepsBorder/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">{mode === 'create' ? 'Nueva Franquicia' : 'Editar Franquicia'}</h2>
          <p className="text-xs text-nepsMuted mt-0.5">
            {mode === 'create'
              ? 'Completá los datos básicos para registrar la franquicia en la editorial seleccionada.'
              : 'Modificá la información básica o cambiá la editorial asociada.'}
          </p>
        </div>
      </div>

      {serverError && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-nepsAccent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-nepsAccent">Error al guardar los datos</p>
              <p className="text-nepsMuted">{serverError}</p>
            </div>
          </div>
          <button type="button" onClick={() => setServerError(null)} className="text-nepsMuted hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Editorial Madre <span className="text-nepsAccent">*</span>
            </label>
            <span className="text-[10px] text-nepsMuted">Obligatorio</span>
          </div>

          <div className="bg-nepsInput border border-nepsPrimary/40 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {selectedPublisher?.urlImage ? (
                <ProtectedImage
                  src={selectedPublisher.urlImage}
                  alt={selectedPublisher.name}
                  className="w-10 h-10 rounded-lg object-cover bg-nepsBg border border-nepsBorder flex-shrink-0"
                  fallback={
                    <div className="w-10 h-10 rounded-lg bg-nepsInput border border-nepsBorder flex items-center justify-center text-nepsMuted text-[10px]">
                      Sin imagen
                    </div>
                  }
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-nepsPrimary/20 text-nepsPrimary border border-nepsPrimary/40 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {selectedPublisher ? getInitials(selectedPublisher.name) : 'Sin imagen'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{selectedPublisher?.name || 'Sin editorial seleccionada'}</p>
                <p className="text-[11px] text-nepsMuted truncate">
                  {selectedPublisher ? `${selectedPublisher.countryName} · ID: ${selectedPublisher.id}` : 'Seleccioná una editorial para continuar'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleChangePublisher}
              className="flex-shrink-0 px-3 py-1.5 bg-nepsCard hover:bg-nepsBorder border border-nepsBorder hover:border-nepsMuted text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-nepsPrimary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
              <span>Cambiar editorial</span>
            </button>
          </div>
        </div>

        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-5">
          <h3 className="text-xs font-bold text-nepsMuted uppercase tracking-wider">Información Básica</h3>

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-white block">
              Nombre de la Franquicia <span className="text-nepsAccent">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              placeholder="Ej: Dragon Ball, Spider-Man..."
              maxLength={150}
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
            />
            {errors.name && <p className="text-[11px] text-nepsAccent">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-white block">Descripción</label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              placeholder="Resumen o sinopsis de la franquicia..."
              className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors resize-none"
            />
            {errors.description && <p className="text-[11px] text-nepsAccent">{errors.description.message}</p>}
          </div>
        </div>

        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-nepsMuted uppercase tracking-wider">Imagen Representativa</h3>
            <p className="text-[11px] text-nepsMuted mt-0.5">Opcional. Se procesará y optimizará en formato WebP.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2 border-2 border-dashed border-nepsBorder hover:border-nepsPrimary/60 bg-nepsInput/50 rounded-2xl p-6 text-center cursor-pointer transition-colors" onClick={() => document.getElementById('franchise-image-input')?.click()}>
              <input type="file" id="franchise-image-input" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="space-y-2">
                <div className="w-10 h-10 bg-nepsCard border border-nepsBorder rounded-full flex items-center justify-center mx-auto text-nepsMuted">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"/></svg>
                </div>
                <p className="text-xs font-medium text-white">Arrastrá y soltá una imagen acá, o <span className="text-nepsPrimary underline">explorá</span></p>
                <p className="text-[10px] text-nepsMuted">PNG, JPG, WEBP hasta 5MB</p>
              </div>
            </div>

            <div className="sm:col-span-1 bg-nepsInput border border-nepsBorder rounded-2xl p-3 flex flex-col items-center justify-center min-h-[140px] relative group">
              {imagePreview && !imagePreview.startsWith('data:') && !imagePreview.startsWith('http') ? (
                <ProtectedImage
                  src={imagePreview}
                  alt="Preview Franquicia"
                  className="w-full h-28 object-cover rounded-xl border border-nepsBorder"
                  fallback={
                    <div className="w-full h-28 flex items-center justify-center text-nepsMuted text-xs">
                      Error al cargar imagen
                    </div>
                  }
                />
              ) : imagePreview ? (
                <img src={imagePreview} alt="Preview Franquicia" className="w-full h-28 object-cover rounded-xl border border-nepsBorder" />
              ) : (
                <div className="text-center p-2">
                  <span className="text-xs text-nepsMuted italic">Sin imagen asignada</span>
                </div>
              )}

              {imagePreview && (
                <div className="absolute inset-0 bg-nepsBg/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="p-2 bg-nepsCard text-white border border-nepsBorder rounded-lg hover:border-nepsPrimary transition-colors cursor-pointer" title="Reemplazar imagen">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </label>
                  <button type="button" onClick={handleDeleteImage} className="p-2 bg-nepsAccent/20 text-nepsAccent border border-nepsAccent/30 rounded-lg hover:bg-nepsAccent hover:text-white transition-colors" title="Eliminar imagen">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {imageFile && <p className="text-[10px] text-nepsMuted mt-1 truncate">{imageFile.name}</p>}
          {imageError && <p className="text-[11px] text-nepsAccent">{imageError}</p>}
        </div>

        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-5">
          <h3 className="text-xs font-bold text-nepsMuted uppercase tracking-wider">Identidad Visual</h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-white block">Color Institucional</label>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={watchColor || '#000000'}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent p-0"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-nepsMuted text-xs">#</span>
                <input
                  type="text"
                  value={watchColor ? watchColor.replace('#', '') : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
                    setValue('color', val ? `#${val}` : '')
                  }}
                  maxLength={6}
                  className="w-28 bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white rounded-xl pl-7 pr-3 py-2 outline-none uppercase tracking-wider font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => setValue('color', '')}
                className="px-3 py-2 bg-nepsInput border border-nepsBorder hover:border-nepsMuted text-nepsMuted hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                <div className="w-3.5 h-3.5 rounded-full border border-slate-500 bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/80 rotate-45 h-0.5 top-1.5"></div>
                </div>
                <span>Sin color</span>
              </button>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-nepsBorder/60">
            <div className="bg-nepsInput border border-nepsBorder rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <label htmlFor="isFeatured" className="text-xs font-bold text-white block cursor-pointer">Franquicia destacada</label>
                <p className="text-[10px] text-nepsMuted mt-0.5">Destacar en portadas y buscadores principales.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="isFeatured" {...register('isFeatured')} className="sr-only peer" />
                <div className="w-9 h-5 bg-nepsBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nepsPrimary"></div>
              </label>
            </div>

            <div className="bg-nepsInput border border-nepsBorder rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <label htmlFor="isOngoing" className="text-xs font-bold text-white block cursor-pointer">Franquicia vigente</label>
                <p className="text-[10px] text-nepsMuted mt-0.5">Indica si la franquicia continúa publicando obras actualmente.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="isOngoing" {...register('isOngoing')} className="sr-only peer" />
                <div className="w-9 h-5 bg-nepsBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-nepsPrimary"></div>
              </label>
            </div>
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
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                <span>{mode === 'create' ? 'Guardar Franquicia' : 'Guardar Cambios'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsPrimary/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 border border-nepsPrimary/20 flex items-center justify-center flex-shrink-0 text-nepsPrimary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Confirmar guardado?</h3>
                <p className="text-xs text-nepsMuted mt-1">Se registrarán los cambios de la franquicia.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">Aseguratate de que los datos y la editorial vinculada sean los correctos antes de continuar.</p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput hover:bg-nepsBorder border border-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                Revisar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="px-5 py-2 bg-nepsPrimary hover:bg-sky-400 text-nepsBg font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
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

export default FranchiseFormPage
