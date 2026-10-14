import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from '@/pages/dashboard-layout'
import {
  getPersons,
  createPerson,
  updatePerson,
  deactivatePerson,
  activatePerson,
} from '../services/person.service'
import type { Person } from '../../../types/persons'

type SortDir = 'asc' | 'desc'
type ModalMode = 'create' | 'edit' | 'deactivate' | 'activate' | null

const DEFAULT_PAGE_SIZE = 12

function PersonsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['persons', currentPage, pageSize, sortDir, search, isActiveFilter],
    queryFn: () =>
      getPersons({
        currentPage,
        pageSize,
        orderBy: 'name',
        orderDir: sortDir,
        search: search || undefined,
      }),
  })

  const persons = useMemo(() => data?.items ?? [], [data])
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Administración de Personas')
    setPageActions(
      <button
        onClick={() => {
          setFormName('')
          setFormError(null)
          setSelectedPerson(null)
          setModalMode('create')
        }}
        className="flex items-center gap-2 px-3.5 py-2 bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold rounded-xl text-xs transition-all shadow-md"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nueva Persona</span>
      </button>,
    )
  }, [setPageTitle, setPageActions])

  const openEditModal = (person: Person) => {
    setSelectedPerson(person)
    setFormName(person.name)
    setFormError(null)
    setModalMode('edit')
  }

  const openDeactivateModal = (person: Person) => {
    setSelectedPerson(person)
    setModalMode('deactivate')
  }

  const openActivateModal = (person: Person) => {
    setSelectedPerson(person)
    setModalMode('activate')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedPerson(null)
    setFormName('')
    setFormError(null)
  }

  const validateName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) {
      return 'El nombre es obligatorio.'
    }
    if (trimmed.length > 150) {
      return 'El nombre no puede superar los 150 caracteres.'
    }
    return null
  }

  const handleCreate = async () => {
    const error = validateName(formName)
    if (error) {
      setFormError(error)
      return
    }

    setIsSaving(true)
    setFormError(null)
    try {
      await createPerson({ name: formName.trim() })
      setSuccessMessage('Persona creada correctamente.')
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear la persona.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedPerson) return

    const error = validateName(formName)
    if (error) {
      setFormError(error)
      return
    }

    setIsSaving(true)
    setFormError(null)
    try {
      await updatePerson(selectedPerson.id, { name: formName.trim() })
      setSuccessMessage('Persona actualizada correctamente.')
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al actualizar la persona.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmStateChange = async () => {
    if (!selectedPerson) return

    setIsSaving(true)
    try {
      if (modalMode === 'deactivate') {
        await deactivatePerson(selectedPerson.id)
        setSuccessMessage(`Persona "${selectedPerson.name}" desactivada.`)
      } else if (modalMode === 'activate') {
        await activatePerson(selectedPerson.id)
        setSuccessMessage(`Persona "${selectedPerson.name}" reactivada.`)
      }

      closeModal()
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al procesar la operación.')
    } finally {
      setIsSaving(false)
    }
  }

  const visibleCount = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalCount)
    return totalCount === 0 ? 0 : `${start}-${end}`
  }, [currentPage, pageSize, totalCount])

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-nepsAccent/10 border border-nepsAccent/30 rounded-2xl p-4 text-xs text-nepsAccent">
          Error al cargar las personas.
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-nepsCard border border-nepsBorder text-xs text-white rounded-xl"
        >
          Volver
        </button>
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

      <div className="bg-nepsCard border border-nepsBorder p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
          <svg className="w-4 h-4 text-nepsMuted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 border-t border-nepsBorder/50">
          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Estado:</label>
            <select
              value={
                isActiveFilter === undefined
                  ? 'todos'
                  : isActiveFilter
                    ? 'activo'
                    : 'inactivo'
              }
              onChange={(e) => {
                const val = e.target.value
                setIsActiveFilter(val === 'todos' ? undefined : val === 'activo')
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Ordenar por:</label>
            <select
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              value="name"
              disabled
            >
              <option value="name">Nombre</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-nepsMuted text-[11px] font-medium">Dirección:</label>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as SortDir)
                setCurrentPage(1)
              }}
              className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl">
        {isLoading && persons.length === 0 ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="h-8 bg-nepsInput rounded-xl w-full"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-nepsInput rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : persons.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white">No se encontraron personas</h3>
            <p className="text-xs text-nepsMuted max-w-sm mx-auto">
              No hay registros que coincidan con los criterios de búsqueda o filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-nepsBorder bg-nepsInput/40 text-[11px] uppercase tracking-wider text-nepsMuted font-bold">
                  <th className="py-3.5 px-6">Nombre</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nepsBorder/60 text-xs">
                {persons.map((person) => (
                  <tr
                    key={person.id}
                    className={`transition-colors ${!person.isActive ? 'opacity-60' : 'hover:bg-nepsInput/30'}`}
                  >
                    <td className="py-4 px-6 font-semibold text-white">
                      {person.name}
                    </td>
                    <td className="py-4 px-6">
                      {person.isActive ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-400 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-slate-400 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(person)}
                          className="px-2.5 py-1.5 bg-nepsInput hover:bg-nepsBorder text-slate-200 rounded-lg border border-nepsBorder transition-colors"
                        >
                          Editar
                        </button>
                        {person.isActive ? (
                          <button
                            onClick={() => openDeactivateModal(person)}
                            className="px-2.5 py-1.5 bg-nepsAccent/10 hover:bg-nepsAccent hover:text-white text-nepsAccent rounded-lg border border-nepsAccent/20 transition-all"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => openActivateModal(person)}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-lg border border-emerald-500/20 transition-all"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsPrimary/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{visibleCount}</strong> de <strong className="text-white">{totalCount}</strong> personas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-nepsInput border border-nepsBorder rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || isLoading}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Primera página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-nepsInput border border-nepsBorder px-3 py-1 rounded-xl">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-nepsMuted">Pág.</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (page >= 1 && page <= totalPages) {
                  setCurrentPage(page)
                }
              }}
              className="w-10 text-center bg-nepsBg border border-nepsBorder focus:border-nepsPrimary text-xs font-bold text-nepsPrimary py-1 rounded-md outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs text-nepsMuted font-medium">/ {totalPages}</span>
          </div>

          <div className="flex items-center bg-nepsInput border border-nepsBorder rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Página siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || isLoading}
              className="p-2 text-nepsMuted hover:text-white hover:bg-nepsCard rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
              title="Última página"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {(modalMode === 'create' || modalMode === 'edit') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop:blur-sm"
          onClick={() => !isSaving && closeModal()}
        >
          <div
            className="bg-nepsCard border border-nepsBorder rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-nepsPrimary/10 border border-nepsPrimary/20 flex items-center justify-center flex-shrink-0 text-nepsPrimary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {modalMode === 'create' ? 'Nueva Persona' : 'Editar Persona'}
                  </h3>
                  <p className="text-xs text-nepsMuted mt-1">
                    {modalMode === 'create'
                      ? 'Ingresá el nombre de la nueva persona.'
                      : 'Modificá el nombre de la persona.'}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="person-name" className="text-xs font-semibold text-white block">
                  Nombre <span className="text-nepsAccent">*</span>
                </label>
                <input
                  id="person-name"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value)
                    setFormError(null)
                  }}
                  maxLength={150}
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                  placeholder="Ej: Alan Moore"
                  autoFocus
                />
                {formError && <p className="text-[11px] text-nepsAccent">{formError}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-nepsBorder">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 bg-nepsInput border border-nepsBorder hover:bg-nepsBorder text-xs text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={modalMode === 'create' ? handleCreate : handleEdit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 8 0 00-4 4H4z" />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Crear' : 'Guardar Cambios'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'deactivate' && selectedPerson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !isSaving && closeModal()}
        >
          <div className="bg-nepsCard border border-nepsAccent/40 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Desactivar Persona</h3>
            <p className="text-xs text-nepsMuted">
              ¿Deseás desactivar a <strong className="text-white">{selectedPerson.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput text-nepsMuted border border-nepsBorder rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmStateChange}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsAccent text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 8 0 00-4 4H4z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Desactivar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'activate' && selectedPerson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !isSaving && closeModal()}
        >
          <div className="bg-nepsCard border border-emerald-500/40 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Reactivar Persona</h3>
            <p className="text-xs text-nepsMuted">
              ¿Deseás reactivar a <strong className="text-white">{selectedPerson.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput text-nepsMuted border border-nepsBorder rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmStateChange}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 8 0 00-4 4H4z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Reactivar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonsPage
