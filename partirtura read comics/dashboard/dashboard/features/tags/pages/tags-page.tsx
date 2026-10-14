import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import {
  getTags,
  createTag,
  updateTag,
  deactivateTag,
  activateTag,
} from '../services/tag.service'
import type { Tag, TagListResponse } from '../types/tag'
import TagsToolbar from '../components/tags-toolbar'
import TagsTable from '../components/tags-table'
import TagsPagination from '../components/tags-pagination'
import TagFormModal from '../components/tag-form-modal'
import TagStateModal from '../components/tag-state-modal'

type SortDir = 'asc' | 'desc'
type ModalMode = 'create' | 'edit' | 'deactivate' | 'activate' | null

const DEFAULT_PAGE_SIZE = 12
const MAX_NAME_LENGTH = 150

export default function TagsPage() {
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery<TagListResponse>({
    queryKey: ['tags', currentPage, pageSize, sortDir, search, isActiveFilter],
    queryFn: () =>
      getTags({
        currentPage,
        pageSize,
        orderBy: 'name',
        orderDir: sortDir,
        search: search || undefined,
        isActive: isActiveFilter,
      }),
  })

  const tags = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Etiquetas')
    setPageActions(
      <button
        onClick={() => {
          setFormName('')
          setFormError(null)
          setSelectedTag(null)
          setModalMode('create')
        }}
        className="flex items-center gap-2 px-3.5 py-2 bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold rounded-xl text-xs transition-all shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nueva Etiqueta</span>
      </button>,
    )
  }, [setPageTitle, setPageActions])

  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag)
    setFormName(tag.name)
    setFormError(null)
    setModalMode('edit')
  }

  const openDeactivateModal = (tag: Tag) => {
    setSelectedTag(tag)
    setModalMode('deactivate')
  }

  const openActivateModal = (tag: Tag) => {
    setSelectedTag(tag)
    setModalMode('activate')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedTag(null)
    setFormName('')
    setFormError(null)
  }

  const validateName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) {
      return 'El nombre de la etiqueta es obligatorio.'
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return 'El nombre no puede superar los 150 caracteres.'
    }
    return null
  }

  const handleSave = async () => {
    const validationError = validateName(formName)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (modalMode === 'create') {
        await createTag({ name: formName.trim() })
        setSuccessMessage('Etiqueta creada correctamente.')
      } else if (modalMode === 'edit' && selectedTag) {
        await updateTag(selectedTag.id, { name: formName.trim() })
        setSuccessMessage('Etiqueta actualizada correctamente.')
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['tags'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar la etiqueta.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmStateChange = async () => {
    if (!selectedTag) return

    setIsSaving(true)
    setFormError(null)

    try {
      if (modalMode === 'deactivate') {
        await deactivateTag(selectedTag.id)
        setSuccessMessage(`Etiqueta "${selectedTag.name}" desactivada.`)
      } else if (modalMode === 'activate') {
        await activateTag(selectedTag.id)
        setSuccessMessage(`Etiqueta "${selectedTag.name}" reactivada.`)
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['tags'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al procesar la operación.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
          {successMessage}
        </div>
      )}

      <TagsToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
        isActiveFilter={isActiveFilter}
        onIsActiveFilterChange={(value) => {
          setIsActiveFilter(value)
          setCurrentPage(1)
        }}
        sortDir={sortDir}
        onSortDirChange={(value) => {
          setSortDir(value)
          setCurrentPage(1)
        }}
      />

      <TagsTable
        tags={tags}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['tags'] })}
        onEdit={openEditModal}
        onDeactivate={openDeactivateModal}
        onActivate={openActivateModal}
      />

      {data && data.totalCount > 0 && (
        <TagsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      )}

      <TagFormModal
        mode={modalMode === 'create' || modalMode === 'edit' ? modalMode : null}
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        name={formName}
        error={formError}
        isSaving={isSaving}
        onNameChange={setFormName}
        onSave={handleSave}
        onClose={closeModal}
      />

      <TagStateModal
        mode={modalMode === 'deactivate' || modalMode === 'activate' ? modalMode : null}
        isOpen={modalMode === 'deactivate' || modalMode === 'activate'}
        tag={selectedTag}
        isSaving={isSaving}
        onConfirm={handleConfirmStateChange}
        onClose={closeModal}
      />
    </div>
  )
}
