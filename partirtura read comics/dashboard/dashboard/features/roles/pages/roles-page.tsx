import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import {
  getRoles,
  createRole,
  updateRole,
  deactivateRole,
  activateRole,
} from '../services/role.service'
import type { Role, RoleListResponse } from '@/types/roles'
import RolesToolbar from '../components/roles-toolbar'
import RolesTable from '../components/roles-table'
import RolesPagination from '../components/roles-pagination'
import RoleFormModal from '../components/role-form-modal'
import RoleStateModal from '../components/role-state-modal'

type SortDir = 'asc' | 'desc'
type ModalMode = 'create' | 'edit' | 'deactivate' | 'activate' | null

const DEFAULT_PAGE_SIZE = 12
const MAX_NAME_LENGTH = 150

export default function RolesPage() {
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery<RoleListResponse>({
    queryKey: ['roles', currentPage, pageSize, sortDir, search, isActiveFilter],
    queryFn: () =>
      getRoles({
        currentPage,
        pageSize,
        orderBy: 'name',
        orderDir: sortDir,
        search: search || undefined,
        isActive: isActiveFilter,
      }),
  })

  const roles = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Roles')
    setPageActions(
      <button
        onClick={() => {
          setFormName('')
          setFormError(null)
          setSelectedRole(null)
          setModalMode('create')
        }}
        className="flex items-center gap-2 px-3.5 py-2 bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold rounded-xl text-xs transition-all shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuevo Rol</span>
      </button>,
    )
  }, [setPageTitle, setPageActions])

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setFormName(role.name)
    setFormError(null)
    setModalMode('edit')
  }

  const openDeactivateModal = (role: Role) => {
    setSelectedRole(role)
    setModalMode('deactivate')
  }

  const openActivateModal = (role: Role) => {
    setSelectedRole(role)
    setModalMode('activate')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedRole(null)
    setFormName('')
    setFormError(null)
  }

  const validateName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) {
      return 'El nombre del rol es obligatorio.'
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
        await createRole({ name: formName.trim() })
        setSuccessMessage('Rol creado correctamente.')
      } else if (modalMode === 'edit' && selectedRole) {
        await updateRole(selectedRole.id, { name: formName.trim() })
        setSuccessMessage('Rol actualizado correctamente.')
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar el rol.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmStateChange = async () => {
    if (!selectedRole) return

    setIsSaving(true)
    setFormError(null)

    try {
      if (modalMode === 'deactivate') {
        await deactivateRole(selectedRole.id)
        setSuccessMessage(`Rol "${selectedRole.name}" desactivado.`)
      } else if (modalMode === 'activate') {
        await activateRole(selectedRole.id)
        setSuccessMessage(`Rol "${selectedRole.name}" reactivado.`)
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
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

      <RolesToolbar
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

      <RolesTable
        roles={roles}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['roles'] })}
        onEdit={openEditModal}
        onDeactivate={openDeactivateModal}
        onActivate={openActivateModal}
      />

      {data && data.totalCount > 0 && (
        <RolesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      )}

      <RoleFormModal
        mode={modalMode === 'create' || modalMode === 'edit' ? modalMode : null}
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        name={formName}
        error={formError}
        isSaving={isSaving}
        onNameChange={setFormName}
        onSave={handleSave}
        onClose={closeModal}
      />

      <RoleStateModal
        mode={modalMode === 'deactivate' || modalMode === 'activate' ? modalMode : null}
        isOpen={modalMode === 'deactivate' || modalMode === 'activate'}
        role={selectedRole}
        isSaving={isSaving}
        onConfirm={handleConfirmStateChange}
        onClose={closeModal}
      />
    </div>
  )
}
