import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import {
  getWorkListById,
  createWorkList,
  updateWorkList,
  searchWorks,
  deactivateWorkList,
  activateWorkList,
} from '../services/work-list.service'
import type {
  WorkListDetailDto,
  SearchWorkResult,
  WorkVisibility,
  CreateWorkListRequest,
  UpdateWorkListRequest,
} from '../types/work-list'
import WorkListInfoSection from '../components/work-list-info-section'
import WorkListWorksSection from '../components/work-list-works-section'
import WorkListSaveBar, { WorkListStatusToggle } from '../components/work-list-save-bar'
import WorkListConfirmModal from '../components/work-list-confirm-modal'

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

const workListSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la lista es obligatorio.')
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres.').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato hexadecimal inválido (ej: #FF5733).')
    .optional()
    .or(z.literal('')),
  listTypeId: z.number({
    required_error: 'Debe seleccionar un tipo de lista.',
  }),
   visibility: z.number({
     required_error: 'Debe seleccionar una visibilidad.',
   }) as z.ZodType<WorkVisibility>,
  works: z.array(
    z.object({
      workId: z.number(),
      position: z.number().int().min(0),
    }),
  ),
})

export type WorkListFormData = z.infer<typeof workListSchema>

type FormMode = 'create' | 'edit'
type ConfirmAction = 'deactivate' | 'reactivate' | 'cancel' | null

export default function WorkListFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { setPageTitle } = useDashboardPageHeader()

  const mode: FormMode = id ? 'edit' : 'create'
  const workListId = id ? Number(id) : undefined

  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [coverCleared, setCoverCleared] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [worksSearch, setWorksSearch] = useState('')
  const [isSearchingWorks, setIsSearchingWorks] = useState(false)
  const [worksSearchResults, setWorksSearchResults] = useState<SearchWorkResult[]>([])
  const [worksSearchError, setWorksSearchError] = useState<string | null>(null)
  const [worksDetailsMap, setWorksDetailsMap] = useState<Record<number, SearchWorkResult>>({})
  const [showWorksSelector, setShowWorksSelector] = useState(false)
  const [worksFranchiseFilter, setWorksFranchiseFilter] = useState<number | undefined>(undefined)
  const [worksPublisherFilter, setWorksPublisherFilter] = useState<number | undefined>(undefined)
  const [worksSeriesFilter, setWorksSeriesFilter] = useState<number | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<WorkListFormData>({
    resolver: zodResolver(workListSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '',
      listTypeId: undefined,
       visibility: 0,
      works: [],
    },
  })

  const { fields: workFields, move, remove } = useFieldArray({
    control,
    name: 'works',
  })

  const watchedName = watch('name')
  const watchedWorks = watch('works')
  const watchedValues = watch()

  const { data: workListDetail, isLoading: isLoadingDetail } = useQuery<WorkListDetailDto>({
    queryKey: ['workList', workListId],
    queryFn: () => getWorkListById(workListId!),
    enabled: mode === 'edit' && !!workListId,
    refetchOnMount: true,
    gcTime: 0,
  })

  useEffect(() => {
    setPageTitle(mode === 'create' ? 'Nueva Lista de Obras' : 'Editar Lista de Obras')
  }, [mode, setPageTitle])

  useEffect(() => {
    if (workListDetail) {
      reset({
        name: workListDetail.name,
        description: workListDetail.description ?? '',
        color: workListDetail.color ?? '',
        listTypeId: workListDetail.listTypeId,
        visibility: workListDetail.visibility,
        works: workListDetail.works.map((w) => ({
          workId: w.work.id,
          position: w.position,
        })),
      })
      setCoverPreview(workListDetail.urlCover)
      setCoverCleared(false)
      setHasUnsavedChanges(false)
      const detailsMap: Record<number, SearchWorkResult> = {}
      workListDetail.works.forEach((w) => {
        detailsMap[w.work.id] = {
          id: w.work.id,
          title: w.work.title,
          numberValue: w.work.numberValue,
          seriesName: w.work.seriesName,
          franchiseName: w.work.franchiseName,
          publisherName: w.work.publisherName,
          urlCover: w.work.urlCover,
          isActive: w.work.isActive,
          workType: '',
        }
      })
      setWorksDetailsMap(detailsMap)
    }
  }, [workListDetail, reset])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setCoverError('El archivo seleccionado no es un formato de imagen válido.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setCoverError('La imagen no puede superar los 5MB.')
      return
    }

    setCoverError(null)
    setCoverFile(file)
    setCoverCleared(false)

    const reader = new FileReader()
    reader.onload = (event) => {
      setCoverPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
    setCoverCleared(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const onSubmit = async (data: WorkListFormData) => {
    setServerError(null)
    setIsSaving(true)

    try {
      const payload: CreateWorkListRequest = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        coverData: undefined,
        coverFileName: undefined,
        color: data.color || null,
        listTypeId: data.listTypeId,
         visibility: data.visibility,
        works: data.works.map((w, index) => ({
          workId: w.workId,
          position: index,
        })),
      }

      if (coverFile) {
        payload.coverData = await fileToBase64(coverFile)
        payload.coverFileName = coverFile.name
      } else if (mode === 'edit' && !coverPreview) {
        payload.coverData = null
        payload.coverFileName = null
        setCoverCleared(true)
      }

      if (mode === 'create') {
        await createWorkList(payload)
      } else if (mode === 'edit' && workListId) {
        const updatePayload: UpdateWorkListRequest = {
          name: payload.name,
          description: payload.description,
          coverData: payload.coverData,
          coverFileName: payload.coverFileName,
          coverImageId: coverFile ? undefined : coverCleared ? 0 : (workListDetail?.coverId ?? null),
          color: payload.color,
          listTypeId: payload.listTypeId,
          visibility: payload.visibility,
          works: payload.works,
        }
        await updateWorkList(workListId, updatePayload)
      }

      await queryClient.invalidateQueries({ queryKey: ['workLists'] })
      if (workListId) {
        await queryClient.invalidateQueries({ queryKey: ['workList', workListId] })
      }
      setSuccessMessage('Lista de obras guardada correctamente.')
      setTimeout(() => {
        navigate('/work-lists')
      }, 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar la lista de obras.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearchWorks = async () => {
    if (!worksSearch.trim()) return
    setIsSearchingWorks(true)
    setWorksSearchError(null)
    try {
       const result = await searchWorks({
        search: worksSearch,
        franchiseId: worksFranchiseFilter,
        publisherId: worksPublisherFilter,
        seriesId: worksSeriesFilter,
      })
       setWorksSearchResults(result.items)
      result.items.forEach((item) => {
        setWorksDetailsMap((prev) => ({ ...prev, [item.id]: item }))
      })
      setShowWorksSelector(true)
    } catch (err) {
      setWorksSearchError(err instanceof Error ? err.message : 'Error al buscar obras.')
    } finally {
      setIsSearchingWorks(false)
    }
  }

  const handleAddWork = (work: SearchWorkResult) => {
    const newPosition = workFields.length
    clearErrors('works')
    const newWorks = [...watchedWorks, { workId: work.id, position: newPosition }]
    reset({ ...watchedValues, works: newWorks })
    setWorksDetailsMap((prev) => ({ ...prev, [work.id]: work }))
    setShowWorksSelector(false)
    setWorksSearch('')
  }

  const handleRemoveWork = (index: number) => {
    remove(index)
    const newWorks = watchedWorks.filter((_, i) => i !== index).map((w, i) => ({ ...w, position: i }))
    reset({ ...watchedValues, works: newWorks })
  }

  const handleMoveWork = (from: number, to: number) => {
    move(from, to)
  }

  const handleDeactivate = async () => {
    if (!workListId) return
    setIsSaving(true)
    setServerError(null)
    try {
      await deactivateWorkList(workListId)
      await queryClient.invalidateQueries({ queryKey: ['workList', workListId] })
      setSuccessMessage('Lista de obras desactivada correctamente.')
      setTimeout(() => navigate('/work-lists'), 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al desactivar la lista.')
    } finally {
      setIsSaving(false)
      setConfirmAction(null)
    }
  }

  const handleReactivate = async () => {
    if (!workListId) return
    setIsSaving(true)
    setServerError(null)
    try {
      await activateWorkList(workListId)
      await queryClient.invalidateQueries({ queryKey: ['workList', workListId] })
      setSuccessMessage('Lista de obras reactivada correctamente.')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al reactivar la lista.')
    } finally {
      setIsSaving(false)
      setConfirmAction(null)
    }
  }

  if (isLoadingDetail && mode === 'edit') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-80 bg-nepsInput rounded-2xl w-full"></div>
        <div className="h-60 bg-nepsInput rounded-2xl w-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
          {successMessage}
        </div>
      )}

      <WorkListStatusToggle
        mode={mode}
        workListDetail={workListDetail ?? null}
        onConfirmAction={setConfirmAction}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit(onSubmit)(e)
        }}
        className="space-y-6"
      >
        <WorkListInfoSection
          control={control}
          errors={errors}
          coverPreview={coverPreview}
          coverFile={coverFile}
          coverError={coverError}
          presetColors={PRESET_COLORS as readonly string[]}
          onCoverChange={handleCoverChange}
          onClearCover={clearCover}
          fileInputRef={fileInputRef}
          listTypeName={workListDetail?.listTypeName ?? null}
        />

        <WorkListWorksSection
          watchedWorks={watchedWorks}
          worksSearchResults={worksSearchResults}
          showWorksSelector={showWorksSelector}
          isSearchingWorks={isSearchingWorks}
          worksSearch={worksSearch}
          worksSearchError={worksSearchError}
           worksDetailsMap={worksDetailsMap}
           worksFranchiseFilter={worksFranchiseFilter}
           worksPublisherFilter={worksPublisherFilter}
           worksSeriesFilter={worksSeriesFilter}
           onSearchChange={setWorksSearch}
          onWorksFranchiseFilterChange={setWorksFranchiseFilter}
          onWorksPublisherFilterChange={setWorksPublisherFilter}
          onWorksSeriesFilterChange={setWorksSeriesFilter}
          onSearchWorks={handleSearchWorks}
          onAddWork={handleAddWork}
          onRemoveWork={handleRemoveWork}
          onMoveWork={handleMoveWork}
          onCloseSearch={() => setShowWorksSelector(false)}
          onToggleSelector={() => setShowWorksSelector(!showWorksSelector)}
        />

        <WorkListSaveBar
          isSaving={isSaving}
          serverError={serverError}
          onCancel={() => {
            if (hasUnsavedChanges) {
              setConfirmAction('cancel')
            } else {
              navigate('/work-lists')
            }
          }}
        />
      </form>

      <WorkListConfirmModal
        action={confirmAction}
        isOpen={confirmAction !== null}
        workListName={watchedName || 'la lista'}
        isSaving={isSaving}
        onConfirm={() => {
          if (confirmAction === 'deactivate') handleDeactivate()
          else if (confirmAction === 'reactivate') handleReactivate()
          else if (confirmAction === 'cancel') navigate('/work-lists')
        }}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  )
}
