import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useForm, type UseFormReturn, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import { useToast } from '@/contexts/toast-context'
import { WorkFormProvider } from '@/features/works/contexts/work-form-context'
import { createPerson } from '@/features/people/services/person.service'
import { createRole } from '@/features/roles/services/role.service'
import {
  getWorkById,
  createWorkWithContent,
  updateWork,
  getWorkImages,
  setWorkCover,
  analyzeWorkWithAi,
  deleteWorkContent,
  retryWorkContent,
  ensurePersonAndRole,
} from '@/features/works/services/works.service'
import WorkForm from '@/features/works/work-form'
import WorkCreateEntityModals from '@/features/works/components/work-create-entity-modals'
import type {
  WorkDetailDto,
  WorkImageItemDto,
  PersonByRoleForm,
  ComicAnalysisResult,
  WorkFormContextState,
  WorkFormData,
} from '@/types/works'

type WorkMode = 'create' | 'edit'

const workSchema = z.object({
  workTypeId: z.number().min(1, 'El tipo de obra es obligatorio.'),
  title: z.string().min(1, 'El título es obligatorio.').max(500),
  description: z.string().max(5000).optional().or(z.literal('')).nullable(),
  numberValue: z.string().max(100).optional().or(z.literal('')).nullable(),
  languageId: z.number().min(1, 'El idioma es obligatorio.'),
  publicationDate: z.string().optional().or(z.literal('')).nullable(),
})

const MAX_CBR_SIZE_MB = 300

function WorkFormPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { workId: workIdParam } = useParams<{ workId?: string }>()
  const location = useLocation()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const workId = workIdParam ? Number(workIdParam) : undefined
  const mode: WorkMode = workId ? 'edit' : 'create'

  const locationContext = (location.state as (WorkFormContextState & { backPath?: string }) | Record<string, unknown> | null) ?? null
  const context = locationContext as WorkFormContextState | null

  const backPath =
    (locationContext as Record<string, unknown> | null)?.backPath ||
    (context?.publisherId !== undefined && context?.publisherId !== null
      ? `/publishers/${context.publisherId}/works`
      : context?.franchiseId !== undefined && context?.franchiseId !== null
        ? `/franchises/${context.franchiseId}/works`
        : context?.seriesId !== undefined && context?.seriesId !== null
          ? `/series/${context.seriesId}/works`
          : '/works')

  const form = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      workTypeId: undefined as number | undefined,
      title: '',
      description: '',
      numberValue: '',
      languageId: undefined as number | undefined,
      publicationDate: '',
    },
  })

  const { reset, watch } = form

  const [workTypeId, setWorkTypeId] = useState<number | undefined>(undefined)
  const [workTypeName, setWorkTypeName] = useState<string | null>(null)
  const [languageId, setLanguageId] = useState<number | undefined>(undefined)
  const [languageName, setLanguageName] = useState<string | null>(null)

  const [personByRoles, setPersonByRoles] = useState<PersonByRoleForm[]>([])
  const [pendingPersonId, setPendingPersonId] = useState<number | undefined>(undefined)
  const [pendingRoleId, setPendingRoleId] = useState<number | undefined>(undefined)
  const [pendingPersonName, setPendingPersonName] = useState<string | null>(null)
  const [pendingRoleName, setPendingRoleName] = useState<string | null>(null)
  const [personNamesMap, setPersonNamesMap] = useState<Record<number, string>>({})
  const [roleNamesMap, setRoleNamesMap] = useState<Record<number, string>>({})

  const [tagInput, setTagInput] = useState<string[]>([])

  const [previousNumberId, setPreviousNumberId] = useState<number | undefined>(undefined)
  const [nextNumberId, setNextNumberId] = useState<number | undefined>(undefined)

  const [isActive, setIsActive] = useState(true)
  const [isActiveModified, setIsActiveModified] = useState(false)

  const [cbrFile, setCbrFile] = useState<File | null>(null)
  const [cbrError, setCbrError] = useState<string | null>(null)
  const [isUploadingCbr, setIsUploadingCbr] = useState(false)
  const [isDeletingContent, setIsDeletingContent] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSettingCover, setIsSettingCover] = useState<number | null>(null)
  const [images, setImages] = useState<WorkImageItemDto[]>([])
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([])

  const [aiSuggestedNumberValue, setAiSuggestedNumberValue] = useState<string | null>(null)
  const [aiSuggestedTitle, setAiSuggestedTitle] = useState<string | null>(null)
  const [aiSuggestedDescription, setAiSuggestedDescription] = useState<string | null>(null)
  const [recommendedPublicationDate, setRecommendedPublicationDate] = useState<string | null>(null)
  const [recommendedGeneralTags, setRecommendedGeneralTags] = useState<string[]>([])
  const [recommendedCharacters, setRecommendedCharacters] = useState<string[]>([])
  const [recommendedWriters, setRecommendedWriters] = useState<string[]>([])
  const [recommendedArtists, setRecommendedArtists] = useState<string[]>([])
  const [recommendedInkers, setRecommendedInkers] = useState<string[]>([])
  const [lastAiResult, setLastAiResult] = useState<ComicAnalysisResult | null>(null)

  const [isCreatePersonModalOpen, setIsCreatePersonModalOpen] = useState(false)
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [newRoleName, setNewRoleName] = useState('')
  const [isCreatingPerson, setIsCreatingPerson] = useState(false)
  const [isCreatingRole, setIsCreatingRole] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { addToast } = useToast()

  const {
    data: workData,
    isLoading: isLoadingWork,
    error: workError,
    refetch: refetchWork,
  } = useQuery<WorkDetailDto>({
    queryKey: ['work', workId],
    queryFn: () => getWorkById(Number(workId)),
    enabled: mode === 'edit' && !!workId,
    staleTime: 10000,
  })



  useEffect(() => {
    if (mode === 'edit' && workData) {
      reset({
        workTypeId: workData.workTypeId,
        title: workData.title,
        description: workData.description ?? '',
        numberValue: workData.numberValue ?? '',
        languageId: workData.languageId ?? undefined,
        publicationDate: workData.publicationDate ? workData.publicationDate.split('T')[0] : '',
      })
      setWorkTypeId(workData.workTypeId)
      setWorkTypeName(workData.workTypeName)
      setLanguageId(workData.languageId ?? undefined)
      setLanguageName(workData.languageName ?? null)
      setIsActive(workData.isActive)
      setPersonByRoles(
        (workData.personByRoles ?? []).map((pr) => ({
          personId: pr.personId ?? 0,
          roleId: pr.roleId ?? 0,
        }))
      )
      setPersonNamesMap(
        (workData.personByRoles ?? []).reduce(
          (acc, pr) => {
            if (pr.personId && pr.personName) {
              acc[pr.personId] = pr.personName
            }
            return acc
          },
          {} as Record<number, string>,
        ),
      )
      setRoleNamesMap(
        (workData.personByRoles ?? []).reduce(
          (acc, pr) => {
            if (pr.roleId && pr.roleName) {
              acc[pr.roleId] = pr.roleName
            }
            return acc
          },
          {} as Record<number, string>,
        ),
      )
      setTagInput((workData.tags ?? []).map((t) => t.name ?? ''))
      setPreviousNumberId(workData.previousNumber?.id ?? undefined)
      setNextNumberId(workData.nextNumber?.id ?? undefined)

      if (workData.iaStatus === 2 && workData.iaResult) {
        const result = workData.iaResult
        const workPersonNames = (workData.personByRoles ?? [])
          .map((pr) => pr.personName ?? '')
          .filter(Boolean)
        const workTagNames = (workData.tags ?? [])
          .map((t) => t.name ?? '')
          .filter(Boolean)

        setAiSuggestedNumberValue(result.number ?? null)
        setAiSuggestedTitle(result.title ?? null)
        setAiSuggestedDescription(result.description ?? (result.summary ?? null))
        setRecommendedGeneralTags(
          (result.tags ?? []).filter((t) => !workTagNames.includes(t)),
        )
        setRecommendedCharacters(
          (result.characters ?? []).filter((c) => !workTagNames.includes(c)),
        )
        setRecommendedWriters(
          (result.writers ?? []).filter((w) => !workPersonNames.includes(w)),
        )
        setRecommendedArtists(
          (result.artists ?? []).filter((a) => !workPersonNames.includes(a)),
        )
        setRecommendedInkers(
          (result.inkers ?? []).filter((i) => !workPersonNames.includes(i)),
        )
        setRecommendedPublicationDate(result.publicationDate ?? null)
        setLastAiResult(result)
      } else {
        setAiSuggestedNumberValue(null)
        setAiSuggestedTitle(null)
        setAiSuggestedDescription(null)
        setRecommendedGeneralTags([])
        setRecommendedCharacters([])
        setRecommendedWriters([])
        setRecommendedArtists([])
        setRecommendedInkers([])
        setRecommendedPublicationDate(null)
        setLastAiResult(null)
      }
    }
  }, [mode, context, workData, reset])

useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (!breadcum) return

    if (mode === 'edit') {
      const seriesId = workData?.seriesId ?? context?.seriesId
      const franchiseId = workData?.franchiseId ?? context?.franchiseId
      const publisherId = workData?.publisherId ?? context?.publisherId
      const seriesName = workData?.seriesName ?? context?.seriesName
      const franchiseName = workData?.franchiseName ?? context?.franchiseName
      const publisherName = workData?.publisherName ?? context?.publisherName

      if (seriesId) {
        breadcum.innerHTML = `Dashboard > Gestionar series > ${seriesName} > ${workData?.title || 'Editar'}`
      } else if (franchiseId) {
        breadcum.innerHTML = `Dashboard > Gestionar franquicias > ${franchiseName} > ${workData?.title || 'Editar'}`
      } else if (publisherId) {
        breadcum.innerHTML = `Dashboard > Gestionar editoriales > ${publisherName} > ${workData?.title || 'Editar'}`
      } else {
        breadcum.innerHTML = 'Dashboard > Gestionar obras > Editar'
      }
    } else {
      const seriesId = context?.seriesId
      const franchiseId = context?.franchiseId
      const publisherId = context?.publisherId
      const seriesName = context?.seriesName
      const franchiseName = context?.franchiseName
      const publisherName = context?.publisherName

      if (seriesId) {
        breadcum.innerHTML = `Dashboard > Gestionar series > ${seriesName} > Nuevo`
      } else if (franchiseId) {
        breadcum.innerHTML = `Dashboard > Gestionar franquicias > ${franchiseName} > Nuevo`
      } else if (publisherId) {
        breadcum.innerHTML = `Dashboard > Gestionar editoriales > ${publisherName} > Nuevo`
      } else {
        breadcum.innerHTML = 'Dashboard > Gestionar obras > Nuevo'
      }
    }

    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [mode, workData, context])

  useEffect(() => {
    async function loadImages() {
      if (mode === 'edit' && workId) {
        try {
          const result = await getWorkImages(Number(workId))
          setImages(result.images)
        } catch {
          setImages([])
        }
      }
    }
    loadImages()
  }, [mode, workId])

  useEffect(() => {
    if (mode === 'create') {
      if (context?.seriesName) {
        setPageTitle('Nuevo Número')
      } else if (context?.franchiseName || context?.publisherName) {
        setPageTitle('Nueva Obra')
      }
    } else {
      setPageTitle(`Editar Obra`)
    }

    setPageActions(
      <button
        onClick={() => {
            if (context?.seriesId) {
            navigate(`/series/${context.seriesId}/works`)
          } else if (context?.franchiseId) {
            navigate(`/franchises/${context.franchiseId}/works`)
          } else if (context?.publisherId) {
            navigate(`/publishers/${context.publisherId}/works`)
          } else {
            navigate('/works')
          }
        }}
        className="flex items-center gap-1.5 text-xs font-semibold text-nepsMuted hover:text-white bg-nepsCard border border-nepsBorder hover:border-nepsBorder px-3 py-1.5 rounded-lg transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        <span className="hidden sm:block">Volver</span>
      </button>,
    )
  }, [mode, workId, workData, setPageTitle, setPageActions, navigate, context])



  const getPersonName = useCallback(
    (personId: number) => personNamesMap[personId] ?? `#${personId}`,
    [personNamesMap],
  )

  const getRoleName = useCallback(
    (roleId: number) => roleNamesMap[roleId] ?? `#${roleId}`,
    [roleNamesMap],
  )

  const handleAddPersonRole = useCallback(() => {
    if (!pendingPersonId || !pendingRoleId) return
    const exists = personByRoles.some(
      (pr) => pr.personId === pendingPersonId && pr.roleId === pendingRoleId,
    )
    if (exists) {
      setPendingPersonId(undefined)
      setPendingRoleId(undefined)
      return
    }
    setPersonByRoles([...personByRoles, { personId: pendingPersonId, roleId: pendingRoleId }])
    if (pendingPersonName) {
      setPersonNamesMap((prev) => ({ ...prev, [pendingPersonId]: pendingPersonName }))
    }
    if (pendingRoleName) {
      setRoleNamesMap((prev) => ({ ...prev, [pendingRoleId!]: pendingRoleName }))
    }
    setPendingPersonId(undefined)
    setPendingRoleId(undefined)
  }, [personByRoles, pendingPersonId, pendingRoleId, pendingPersonName, pendingRoleName])

  const handleRemovePersonRole = useCallback((index: number) => {
    setPersonByRoles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleCbrChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (
        !file.name.toLowerCase().endsWith('.cbr') &&
        !file.name.toLowerCase().endsWith('.cbz')
      ) {
        setCbrError('Solo se permiten archivos .cbr o .cbz.')
        return
      }
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > MAX_CBR_SIZE_MB) {
        setCbrError(`El archivo excede el tamaño máximo de ${MAX_CBR_SIZE_MB}MB.`)
        return
      }

      if (mode === 'create') {
        setCbrFile(file)
        setCbrError(null)
        return
      }

      if (!workId) return
      setCbrFile(file)
      setCbrError(null)
      setIsUploadingCbr(true)
      try {
        await retryWorkContent(Number(workId), file)
        const result = await getWorkImages(Number(workId))
        setImages(result.images)
        refetchWork()
        setSuccessMessage('Reintento encolado. El procesamiento puede demorar.')
        setTimeout(() => setSuccessMessage(''), 4000)
      } catch (err) {
        setCbrError(err instanceof Error ? err.message : 'Error al reintentar el procesamiento.')
      } finally {
        setIsUploadingCbr(false)
        e.target.value = ''
      }
    },
    [mode, workId, refetchWork],
  )

  const handleSetCover = useCallback(
    async (imageId: number) => {
      if (!workId) return
      setIsSettingCover(imageId)
      try {
        await setWorkCover(Number(workId), imageId)
        refetchWork()
        const result = await getWorkImages(Number(workId))
        setImages(result.images)
        setSuccessMessage('Portada actualizada.')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Error al actualizar la portada.')
      } finally {
        setIsSettingCover(null)
      }
    },
    [workId, refetchWork],
  )

  const handleAnalyzeWithAi = useCallback(async () => {
    if (!workId) return
    if (selectedImageIds.length === 0) {
      setServerError('Seleccioná al menos una imagen para analizar.')
      return
    }
    setIsAnalyzing(true)
    setServerError(null)
    try {
      await analyzeWorkWithAi(Number(workId), selectedImageIds)

      setSuccessMessage('Análisis de IA solicitado. Se procesa en background.')
      addToast('success', 'Análisis de IA solicitado. Se procesa en background.')

      queryClient.invalidateQueries({ queryKey: ['work', workId] })
      queryClient.invalidateQueries({ queryKey: ['works'] })
      queryClient.invalidateQueries({ queryKey: ['publisher-works'] })
      queryClient.invalidateQueries({ queryKey: ['franchise-works'] })
      queryClient.invalidateQueries({ queryKey: ['series-works'] })
      queryClient.invalidateQueries({ queryKey: ['work-lists'] })

      setTimeout(() => {
        navigate(backPath)
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al solicitar análisis de IA.'
      setServerError(message)
      addToast('error', message)
    } finally {
      setIsAnalyzing(false)
    }
  }, [workId, selectedImageIds, queryClient, navigate, backPath, addToast])

  const handleDeleteContent = useCallback(async () => {
    if (!workId) return
    if (!confirm('¿Eliminar todo el contenido CBR y las imágenes extraídas?')) return
    setIsDeletingContent(true)
    try {
      await deleteWorkContent(Number(workId))
      setImages([])
      refetchWork()
      setSuccessMessage('Contenido eliminado.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al eliminar el contenido.')
    } finally {
      setIsDeletingContent(false)
    }
  }, [workId, refetchWork])

  const handleRetryContent = useCallback(async () => {
    if (!workId) return
    if (!cbrFile) {
      setServerError('Seleccioná un archivo antes de reintentar.')
      return
    }
    setIsRetrying(true)
    try {
      await retryWorkContent(Number(workId), cbrFile)
      refetchWork()
      setSuccessMessage('Reintento encolado. El procesamiento puede demorar.')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al reintentar el procesamiento.')
    } finally {
      setIsRetrying(false)
    }
  }, [workId, cbrFile, refetchWork])

  const toggleImageForAi = useCallback((imageId: number) => {
    setSelectedImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId],
    )
  }, [])

  const clearSelectedImages = useCallback(() => setSelectedImageIds([]), [])

  const handleApplyTitle = useCallback((title: string | null) => {
    if (title) reset({ ...watch(), title })
  }, [reset, watch])

  const handleApplyNumberValue = useCallback((value: string | null) => {
    if (value) reset({ ...watch(), numberValue: value })
  }, [reset, watch])

  const handleApplyDescription = useCallback((description: string | null) => {
    if (description) reset({ ...watch(), description })
  }, [reset, watch])

  const handleApplySummary = useCallback((summary: string | null) => {
    if (summary) reset({ ...watch(), description: summary })
  }, [reset, watch])

  const handleApplyPublicationDate = useCallback((date: string | null) => {
    if (date) reset({ ...watch(), publicationDate: date })
  }, [reset, watch])

  const acceptRecommendedTag = useCallback((tag: string) => {
    if (!tagInput.includes(tag)) {
      setTagInput([...tagInput, tag])
    }
    setRecommendedGeneralTags((prev) => prev.filter((t) => t !== tag))
  }, [tagInput])

  const dismissRecommendedTag = useCallback((tag: string) => {
    setRecommendedGeneralTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const acceptRecommendedCharacter = useCallback((character: string) => {
    if (!tagInput.includes(character)) {
      setTagInput([...tagInput, character])
    }
    setRecommendedCharacters((prev) => prev.filter((c) => c !== character))
  }, [tagInput])

  const dismissRecommendedCharacter = useCallback((character: string) => {
    setRecommendedCharacters((prev) => prev.filter((c) => c !== character))
  }, [])

  const acceptRecommendedPerson = useCallback(
    ({ personName, roleName }: { personName: string; roleName: string }) => {
      const exists = personByRoles.some((pr) => getPersonName(pr.personId) === personName)
      if (exists) {
        return
      }

      ensurePersonAndRole(personName, roleName)
        .then((payload) => {
          const newRole = { personId: payload.person.id, roleId: payload.role.id }
          setPersonByRoles((prev) => [...prev, newRole])
          setPersonNamesMap((prev) => ({ ...prev, [payload.person.id]: payload.person.name }))
          setRoleNamesMap((prev) => ({ ...prev, [payload.role.id]: payload.role.name }))
          setRecommendedWriters((prev) => prev.filter((n) => n !== personName))
          setRecommendedArtists((prev) => prev.filter((n) => n !== personName))
          setRecommendedInkers((prev) => prev.filter((n) => n !== personName))
        })
        .catch((err) => {
          setServerError(err instanceof Error ? err.message : 'Error al asegurar persona y rol.')
        })
    },
    [personByRoles, getPersonName, setPersonByRoles, setRecommendedWriters, setRecommendedArtists, setRecommendedInkers, setPersonNamesMap, setRoleNamesMap, setServerError],
  )

  const dismissRecommendedPerson = useCallback(
    (group: string, name: string) => {
      if (group === 'writers') {
        setRecommendedWriters((prev) => prev.filter((n) => n !== name))
      } else if (group === 'artists') {
        setRecommendedArtists((prev) => prev.filter((n) => n !== name))
      } else {
        setRecommendedInkers((prev) => prev.filter((n) => n !== name))
      }
    },
    [setRecommendedWriters, setRecommendedArtists, setRecommendedInkers],
  )

  const handleOpenCreatePersonModal = useCallback(() => {
    setNewPersonName(pendingPersonName ?? '')
    setIsCreatePersonModalOpen(true)
  }, [pendingPersonName])

  const handleOpenCreateRoleModal = useCallback(() => {
    setNewRoleName(pendingRoleName ?? '')
    setIsCreateRoleModalOpen(true)
  }, [pendingRoleName])

  const handleCreatePerson = useCallback(async () => {
    if (!newPersonName.trim()) return
    setIsCreatingPerson(true)
    try {
      const result = await createPerson({ name: newPersonName.trim() })
      setPendingPersonId(result.id)
      setPendingPersonName(result.name)
      setIsCreatePersonModalOpen(false)
      setNewPersonName('')
      setSuccessMessage(`Persona "${result.name}" creada.`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la persona.')
    } finally {
      setIsCreatingPerson(false)
    }
  }, [newPersonName])

  const handleCreateRole = useCallback(async () => {
    if (!newRoleName.trim()) return
    setIsCreatingRole(true)
    try {
      const result = await createRole({ name: newRoleName.trim() })
      setPendingRoleId(result.id)
      setPendingRoleName(result.name)
      setIsCreateRoleModalOpen(false)
      setNewRoleName('')
      setSuccessMessage(`Rol "${result.name}" creado.`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear el rol.')
    } finally {
      setIsCreatingRole(false)
    }
  }, [newRoleName])

  const handleConfirmSave = useCallback(async () => {
    setIsConfirmOpen(false)
    setIsSaving(true)
    setServerError(null)

    const title = watch('title').trim()
    if (!title) {
      setServerError('El título es obligatorio.')
      setIsSaving(false)
      return
    }

    if (mode === 'create' && !cbrFile) {
      setServerError('Tenés que seleccionar un archivo CBR/CBZ para crear la obra.')
      setIsSaving(false)
      return
    }

    const contextPayload = {
      workTypeId: workTypeId as number,
      languageId: languageId as number,
      title,
      description: watch('description') || null,
    }

    try {
      if (mode === 'create' && cbrFile) {
        // Determine parent ID based on cascading hierarchy: series > franchise > publisher
        const seriesId = context?.seriesId
        const franchiseId = context?.franchiseId
        const publisherId = context?.publisherId

        let parentPayload = {}
        if (seriesId) {
          parentPayload = { seriesId }
        } else if (franchiseId) {
          parentPayload = { franchiseId }
        } else if (publisherId) {
          parentPayload = { publisherId }
        }

        const createPayload = {
          ...contextPayload,
          contentFile: cbrFile,
          ...parentPayload,
        }
        await createWorkWithContent(createPayload)
        setSuccessMessage('Obra creada. El procesamiento del archivo puede demorar.')
        queryClient.invalidateQueries({ queryKey: ['works'] })
        queryClient.invalidateQueries({ queryKey: ['publisher-works'] })
        queryClient.invalidateQueries({ queryKey: ['franchise-works'] })
        queryClient.invalidateQueries({ queryKey: ['series-works'] })
        queryClient.invalidateQueries({ queryKey: ['work-lists'] })
        setTimeout(() => {
          navigate(backPath)
        }, 1500)
      } else if (mode === 'edit' && workId) {
        // Determine parent ID based on cascading hierarchy: series > franchise > publisher
        const seriesId = workData?.seriesId
        const franchiseId = workData?.franchiseId
        const publisherId = workData?.publisherId

        let parentPayload = {}
        if (seriesId) {
          parentPayload = { seriesId }
        } else if (franchiseId) {
          parentPayload = { franchiseId }
        } else if (publisherId) {
          parentPayload = { publisherId }
        }

        const editPayload = {
          ...contextPayload,
          publicationDate: watch('publicationDate') || '',
          isActive,
          ...parentPayload,
          numberValue: watch('numberValue') || null,
          previousNumberId: previousNumberId ?? null,
          nextNumberId: nextNumberId ?? null,
          personByRoles: personByRoles.filter(
            (pr, idx, arr) =>
              arr.findIndex((p) => p.personId === pr.personId && p.roleId === pr.roleId) ===
              idx,
          ),
          tags: tagInput.map((name) => ({ name })),
        }

        sessionStorage.setItem('last-work-edit-payload', JSON.stringify(editPayload, null, 2))

        await updateWork(Number(workId), editPayload)
        setSuccessMessage('Obra actualizada.')
        queryClient.invalidateQueries({ queryKey: ['works'] })
        queryClient.invalidateQueries({ queryKey: ['publisher-works'] })
        queryClient.invalidateQueries({ queryKey: ['franchise-works'] })
        queryClient.invalidateQueries({ queryKey: ['series-works'] })
        queryClient.invalidateQueries({ queryKey: ['work-lists'] })
        queryClient.invalidateQueries({ queryKey: ['work', workId] })
        setTimeout(() => {
          navigate(backPath)
        }, 1500)
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar la obra.')
    } finally {
      setIsSaving(false)
    }
  }, [
    mode, workId, context, backPath, workTypeId, cbrFile, languageId,
    isActive, personByRoles, tagInput, previousNumberId, nextNumberId, watch,
    queryClient, navigate, workData,
  ])

  const handleCancel = useCallback(() => {
    navigate(backPath)
  }, [navigate, backPath])

  const contextValue = {
    mode,
    workId,
    workTypeId,
    setWorkTypeId,
    workTypeName,
    setWorkTypeName,
    languageId,
    setLanguageId,
    languageName,
    setLanguageName,
    workData: workData ?? null,
    isActive,
    isActiveModified,
    setIsActiveModified,
    setIsActive: (active: boolean) => {
      setIsActive(active)
      setIsActiveModified(true)
    },
    context: locationContext,
    personByRoles,
    setPersonByRoles,
    pendingPersonId,
    setPendingPersonId,
    pendingRoleId,
    setPendingRoleId,
    pendingPersonName,
    setPendingPersonName,
    pendingRoleName,
    setPendingRoleName,
    personNamesMap,
    setPersonNamesMap,
    roleNamesMap,
    setRoleNamesMap,
    tagInput,
    setTagInput,
    previousNumberId,
    setPreviousNumberId,
    nextNumberId,
    setNextNumberId,
    cbrFile,
    setCbrFile,
    cbrError,
    setCbrError,
    isUploadingCbr,
    setIsUploadingCbr,
    isDeletingContent,
    setIsDeletingContent,
    isRetrying,
    setIsRetrying,
    isAnalyzing,
    setIsAnalyzing,
    isSettingCover,
    setIsSettingCover,
    images,
    setImages,
    selectedImageIds,
    setSelectedImageIds,
    aiSuggestedNumberValue,
    setAiSuggestedNumberValue,
    aiSuggestedTitle,
    setAiSuggestedTitle,
    aiSuggestedDescription,
    setAiSuggestedDescription,
    recommendedPublicationDate,
    setRecommendedPublicationDate,
    recommendedGeneralTags,
    setRecommendedGeneralTags,
    recommendedCharacters,
    setRecommendedCharacters,
    recommendedWriters,
    setRecommendedWriters,
    recommendedArtists,
    setRecommendedArtists,
    recommendedInkers,
    setRecommendedInkers,
    lastAiResult,
    successMessage,
    setSuccessMessage,
    serverError,
    setServerError,
    isSaving,
    setIsSaving,
    isConfirmOpen,
    setIsConfirmOpen,
    isCreatePersonModalOpen,
    setIsCreatePersonModalOpen,
    isCreateRoleModalOpen,
    setIsCreateRoleModalOpen,
    newPersonName,
    setNewPersonName,
    newRoleName,
    setNewRoleName,
    isCreatingPerson,
    setIsCreatingPerson,
    isCreatingRole,
    setIsCreatingRole,
    form: form as unknown as UseFormReturn<FieldValues>,
    handlers: {
      handleAddPersonRole,
      handleRemovePersonRole,
      handleCbrChange,
      handleSetCover,
      handleAnalyzeWithAi,
      handleDeleteContent,
      handleRetryContent,
      toggleImageForAi,
      clearSelectedImages,
      acceptRecommendedTag,
      dismissRecommendedTag,
      acceptRecommendedCharacter,
      dismissRecommendedCharacter,
      acceptRecommendedPerson,
      dismissRecommendedPerson,
      handleApplyTitle,
      handleApplyNumberValue,
      handleApplyDescription,
      handleApplySummary,
      handleApplyPublicationDate,
      handleOpenCreatePersonModal,
      handleOpenCreateRoleModal,
      handleCreatePerson,
      handleCreateRole,
      handleConfirmSave,
      handleCancel,
    },
    getPersonName,
    getRoleName,
  }

  if (mode === 'edit' && isLoadingWork) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-8 text-center">
          <div className="text-xs text-nepsMuted">Cargando datos de la obra...</div>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && workError) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {workError instanceof Error ? workError.message : 'Error al cargar la obra.'}
        </div>
      </div>
    )
  }

  return (
    <WorkFormProvider value={contextValue}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <WorkForm />
        <WorkCreateEntityModals />
      </div>
    </WorkFormProvider>
  )
}

export default WorkFormPage
