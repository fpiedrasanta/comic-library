import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import {
  getListTypes,
  createListType,
  updateListType,
  deactivateListType,
  activateListType,
} from '../services/list-type.service'
import type { ListType, ListTypeListResponse } from '../types/list-type'
import ListTypesToolbar from '../components/list-types-toolbar'
import ListTypesTable from '../components/list-types-table'
import ListTypesPagination from '../components/list-types-pagination'
import ListTypeFormModal from '../components/list-type-form-modal'
import ListTypeStateModal from '../components/list-type-state-modal'

type SortDir = 'asc' | 'desc'
type ModalMode = 'create' | 'edit' | 'deactivate' | 'activate' | null

const DEFAULT_PAGE_SIZE = 12
const MAX_NAME_LENGTH = 100

export default function ListTypesPage() {
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedListType, setSelectedListType] = useState<ListType | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery<ListTypeListResponse>({
    queryKey: ['listTypes', currentPage, pageSize, sortDir, search, isActiveFilter],
    queryFn: () =>
      getListTypes({
        currentPage,
        pageSize,
        orderBy: 'name',
        orderDir: sortDir,
        search: search || undefined,
        isActive: isActiveFilter,
      }),
  })

  const listTypes = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Tipos de Lista')
    setPageActions(
      <button
        onClick={() => {
          setFormName('')
          setFormError(null)
          setSelectedListType(null)
          setModalMode('create')
        }}
        className="flex items-center gap-2 px-3.5 py-2 bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold rounded-xl text-xs transition-all shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuevo Tipo de Lista</span>
      </button>,
    )
  }, [setPageTitle, setPageActions])

  const openEditModal = (listType: ListType) => {
    setSelectedListType(listType)
    setFormName(listType.name)
    setFormError(null)
    setModalMode('edit')
  }

  const openDeactivateModal = (listType: ListType) => {
    setSelectedListType(listType)
    setModalMode('deactivate')
  }

  const openActivateModal = (listType: ListType) => {
    setSelectedListType(listType)
    setModalMode('activate')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedListType(null)
    setFormName('')
    setFormError(null)
  }

  const validateName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) {
      return 'El nombre del tipo de lista es obligatorio.'
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return 'El nombre no puede superar los 100 caracteres.'
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
        await createListType({ name: formName.trim() })
        setSuccessMessage('Tipo de lista creado correctamente.')
      } else if (modalMode === 'edit' && selectedListType) {
        await updateListType(selectedListType.id, { name: formName.trim() })
        setSuccessMessage('Tipo de lista actualizado correctamente.')
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['listTypes'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar el tipo de lista.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmStateChange = async () => {
    if (!selectedListType) return

    setIsSaving(true)
    setFormError(null)

    try {
      if (modalMode === 'deactivate') {
        await deactivateListType(selectedListType.id)
        setSuccessMessage(`Tipo de lista "${selectedListType.name}" desactivado.`)
      } else if (modalMode === 'activate') {
        await activateListType(selectedListType.id)
        setSuccessMessage(`Tipo de lista "${selectedListType.name}" reactivado.`)
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['listTypes'] })
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

      <ListTypesToolbar
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

      <ListTypesTable
        listTypes={listTypes}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['listTypes'] })}
        onEdit={openEditModal}
        onDeactivate={openDeactivateModal}
        onActivate={openActivateModal}
      />

      {data && data.totalCount > 0 && (
        <ListTypesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      )}

      <ListTypeFormModal
        mode={modalMode === 'create' || modalMode === 'edit' ? modalMode : null}
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        name={formName}
        error={formError}
        isSaving={isSaving}
        onNameChange={setFormName}
        onSave={handleSave}
        onClose={closeModal}
      />

      <ListTypeStateModal
        mode={modalMode === 'deactivate' || modalMode === 'activate' ? modalMode : null}
        isOpen={modalMode === 'deactivate' || modalMode === 'activate'}
        listType={selectedListType}
        isSaving={isSaving}
        onConfirm={handleConfirmStateChange}
        onClose={closeModal}
      />
    </div>
  )
}
