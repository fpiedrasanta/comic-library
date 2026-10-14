import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import { getWorkLists, deactivateWorkList, activateWorkList } from '../services/work-list.service'
import type { WorkListListResponse, WorkListListItemDto } from '../types/work-list'
import WorkListsToolbar from '../components/work-lists-toolbar'
import WorkListsTable from '../components/work-lists-table'
import WorkListsPagination from '../components/work-lists-pagination'
import WorkListStateModal from '../components/work-list-state-modal'

type SortField = 'name' | 'createdAt'
type SortDir = 'asc' | 'desc'
type ModalMode = 'deactivate' | 'activate' | null

const DEFAULT_PAGE_SIZE = 12

export default function WorkListsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)

  const [franchiseFilter, setFranchiseFilter] = useState<number | undefined>(undefined)
  const [publisherFilter, setPublisherFilter] = useState<number | undefined>(undefined)
  const [listTypeFilter, setListTypeFilter] = useState<number | undefined>(undefined)
  const [createdAtFrom, setCreatedAtFrom] = useState<string>('')
  const [createdAtTo, setCreatedAtTo] = useState<string>('')

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedWorkList, setSelectedWorkList] = useState<WorkListListItemDto | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data, isLoading, error } = useQuery<WorkListListResponse>({
    queryKey: [
      'workLists',
      currentPage,
      pageSize,
      search,
      sortField,
      sortDir,
      franchiseFilter,
      publisherFilter,
      listTypeFilter,
      isActiveFilter,
      createdAtFrom,
      createdAtTo,
    ],
    queryFn: () =>
      getWorkLists({
        page: currentPage,
        pageSize,
        search: search || undefined,
        franchiseId: franchiseFilter,
        publisherId: publisherFilter,
        listTypeId: listTypeFilter,
        isActive: isActiveFilter,
        createdAtFrom: createdAtFrom || undefined,
        createdAtTo: createdAtTo || undefined,
        orderBy: sortField,
        orderDir: sortDir,
      }),
    refetchOnMount: true,
    gcTime: 0,
  })

  const workLists = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Listas de Obras')
    setPageActions(
      <button
        onClick={() => navigate('/work-lists/create')}
        className="flex items-center gap-2 px-3.5 py-2 bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold rounded-xl text-xs transition-all shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nueva Lista</span>
      </button>,
    )
  }, [setPageTitle, setPageActions, navigate])

  const openEditModal = (workList: WorkListListItemDto) => {
    navigate(`/work-lists/${workList.id}/edit`)
  }

  const openDeactivateModal = (workList: WorkListListItemDto) => {
    setSelectedWorkList(workList)
    setModalMode('deactivate')
  }

  const openActivateModal = (workList: WorkListListItemDto) => {
    setSelectedWorkList(workList)
    setModalMode('activate')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedWorkList(null)
  }

  const handleConfirmStateChange = async () => {
    if (!selectedWorkList) return

    setIsSaving(true)
    setSuccessMessage(null)

    try {
      if (modalMode === 'deactivate') {
        await deactivateWorkList(selectedWorkList.id)
        setSuccessMessage(`Lista de obras "${selectedWorkList.name}" desactivada.`)
      } else if (modalMode === 'activate') {
        await activateWorkList(selectedWorkList.id)
        setSuccessMessage(`Lista de obras "${selectedWorkList.name}" reactivada.`)
      }

      closeModal()
      await queryClient.invalidateQueries({ queryKey: ['workLists'] })
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

      <WorkListsToolbar
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
        franchiseFilter={franchiseFilter}
        onFranchiseFilterChange={(value) => {
          setFranchiseFilter(value)
          setCurrentPage(1)
        }}
        publisherFilter={publisherFilter}
        onPublisherFilterChange={(value) => {
          setPublisherFilter(value)
          setCurrentPage(1)
        }}
        listTypeFilter={listTypeFilter}
        onListTypeFilterChange={(value) => {
          setListTypeFilter(value)
          setCurrentPage(1)
        }}
        createdAtFrom={createdAtFrom}
        onCreatedAtFromChange={(value) => {
          setCreatedAtFrom(value)
          setCurrentPage(1)
        }}
        createdAtTo={createdAtTo}
        onCreatedAtToChange={(value) => {
          setCreatedAtTo(value)
          setCurrentPage(1)
        }}
        sortField={sortField}
        onSortFieldChange={(value) => {
          setSortField(value)
          setCurrentPage(1)
        }}
         sortDir={sortDir}
         onSortDirChange={(value) => {
           setSortDir(value)
           setCurrentPage(1)
         }}
       />

      <WorkListsTable
        workLists={workLists}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['workLists'] })}
        onEdit={openEditModal}
        onDeactivate={openDeactivateModal}
        onActivate={openActivateModal}
      />

      {data && data.totalCount > 0 && (
        <WorkListsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      )}

      <WorkListStateModal
        mode={modalMode}
        isOpen={modalMode === 'deactivate' || modalMode === 'activate'}
        workList={selectedWorkList}
        error={formError}
        isSaving={isSaving}
        onConfirm={handleConfirmStateChange}
        onClose={closeModal}
      />
    </div>
  )
}
