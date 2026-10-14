import { useState, useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDashboardPageHeader } from './dashboard-layout'
import { getCountries, createCountry, updateCountry, deactivateCountry, activateCountry } from '../features/users/services/country.service'
import type { Country } from '../types/country'

type SortField = 'name' | 'code' | 'isActive'
type SortDir = 'asc' | 'desc'

type ModalMode = 'create' | 'edit' | 'deactivate' | 'activate' | null

function CountriesPage() {
  const queryClient = useQueryClient()
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      breadcum.innerHTML = 'Dashboard &gt; Gestionar países'
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['countries', currentPage, pageSize, sortField, sortDir, search],
    queryFn: () =>
      getCountries({
        currentPage,
        pageSize,
        orderBy: sortField,
        orderDir: sortDir,
        search: search || undefined,
      }),
  })

  const countries = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  useEffect(() => {
    setPageTitle('Gestión de Países')
    setPageActions(
      <button
        onClick={() => openModal('create')}
        className="bg-nepsPrimary text-slate-950 hover:bg-sky-300 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-nepsPrimary/10 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Nuevo país</span>
      </button>
    )
  }, [setPageTitle, setPageActions])

  const openModal = (mode: ModalMode, country?: Country) => {
    setModalMode(mode)
    setSelectedCountry(country || null)
    setServerError(null)
    setFormErrors({})

    if (mode === 'create') {
      setFormCode('')
      setFormName('')
    } else if (country) {
      setFormCode(country.code)
      setFormName(country.name)
    }
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedCountry(null)
    setIsSaving(false)
    setServerError(null)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formCode.trim()) {
      errors.code = 'El código es obligatorio.'
    } else if (formCode.trim().length !== 3) {
      errors.code = 'El código debe tener 3 caracteres.'
    }

    if (!formName.trim()) {
      errors.name = 'El nombre del país es obligatorio.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveCountry = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setServerError(null)

    try {
      if (modalMode === 'create') {
        await createCountry({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
        })
        setSuccessMessage('País creado correctamente')
      } else if (modalMode === 'edit' && selectedCountry) {
        await updateCountry(selectedCountry.id, {
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
        })
        setSuccessMessage('País actualizado correctamente')
      }

      closeModal()
      setTimeout(() => setSuccessMessage(null), 3000)
      await queryClient.invalidateQueries({ queryKey: ['countries'] })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al guardar el país.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmStateChange = async () => {
    if (!selectedCountry) return

    setIsSaving(true)
    setServerError(null)

    try {
      if (modalMode === 'deactivate') {
        await deactivateCountry(selectedCountry.id)
        setSuccessMessage('País desactivado correctamente')
      } else if (modalMode === 'activate') {
        await activateCountry(selectedCountry.id)
        setSuccessMessage('País activado correctamente')
      }

      closeModal()
      setTimeout(() => setSuccessMessage(null), 3000)
      await queryClient.invalidateQueries({ queryKey: ['countries'] })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al cambiar el estado del país.')
    } finally {
      setIsSaving(false)
    }
  }

  const visibleCount = useMemo(() => {
    const start = (currentPage - 1) * 12 + 1
    const end = Math.min(currentPage * 12, totalCount)
    return totalCount === 0 ? 0 : `${start}-${end}`
  }, [currentPage, totalCount])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nepsBorder/60 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Catálogo Global de Países</h2>
          <p className="text-xs text-nepsMuted mt-0.5">Administra los países habilitados para el registro y parametrización regional en el sistema.</p>
        </div>
      </div>

      {error && (
        <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-2xl p-4 text-xs text-nepsAccent">
          {error instanceof Error ? error.message : 'Error al cargar los países.'}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400">
          {successMessage}
        </div>
      )}

      <div className="bg-nepsCard border border-nepsBorder p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <input
              type="text"
              placeholder="Buscar por código ISO o nombre..."
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

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Ordenar por:</label>
              <select
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value as SortField)
                  setCurrentPage(1)
                }}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="name">Nombre</option>
                <option value="code">Código</option>
                <option value="isActive">Estado</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-nepsMuted text-[11px] font-medium">Dirección:</label>
              <select
                value={sortDir}
                onChange={(e) => {
                  setSortDir(e.target.value as SortDir)
                  setCurrentPage(1)
                }}
                className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">Cargando países...</div>
        ) : countries.length === 0 ? (
          <div className="col-span-full text-center text-nepsMuted text-xs py-8">No se encontraron países.</div>
        ) : (
          countries.map((country) => (
            <div
              key={country.id}
              className={`flex flex-col justify-between space-y-4 rounded-xl p-4 border transition-all ${
                country.isActive
                  ? 'bg-nepsCard border-nepsBorder hover:border-nepsPrimary/60'
                  : 'opacity-70 bg-nepsCard/60 border-nepsBorder'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 bg-nepsInput border border-nepsBorder font-mono font-bold text-xs rounded-lg ${
                    country.isActive ? 'text-nepsPrimary' : 'text-slate-400'
                  }`}>
                    {country.code}
                  </span>
                  <h3 className={`text-sm font-bold truncate ${
                    country.isActive ? 'text-white' : 'text-slate-300'
                  }`}>
                    {country.name}
                  </h3>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                  country.isActive
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-slate-800 border-slate-700'
                }`} title={country.isActive ? 'País activo en la plataforma' : 'País deshabilitado temporalmente'}>
                  <span className={`w-2 h-2 rounded-full ${
                    country.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}></span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    country.isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {country.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="border-t border-nepsBorder/60 pt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => openModal('edit', country)}
                  className="px-2.5 py-1.5 bg-nepsInput hover:bg-nepsBorder text-slate-200 font-semibold rounded-lg text-xs border border-nepsBorder transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 text-nepsMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar</span>
                </button>
                {country.isActive ? (
                  <button
                    onClick={() => openModal('deactivate', country)}
                    className="px-2.5 py-1.5 bg-nepsAccent/10 hover:bg-nepsAccent hover:text-white text-nepsAccent font-semibold rounded-lg text-xs border border-nepsAccent/20 transition-all flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span>Desactivar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openModal('activate', country)}
                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-lg text-xs border border-emerald-500/20 transition-all flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Activar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-nepsPrimary/60"></span>
          <span className="text-xs text-nepsMuted font-medium">
            Mostrando <strong className="text-white">{isLoading ? '...' : visibleCount}</strong> de <strong className="text-white">{totalCount}</strong> países
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

      {modalMode === 'create' || modalMode === 'edit' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-nepsBorder/60 pb-3">
              <h3 className="text-base font-bold text-white">
                {modalMode === 'create' ? 'Nuevo País' : 'Editar País'}
              </h3>
              <button onClick={closeModal} className="text-nepsMuted hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {serverError && (
              <div className="bg-nepsAccent/10 border border-nepsAccent/20 rounded-xl p-3 text-xs text-nepsAccent">
                {serverError}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSaveCountry() }} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="countryCode" className="text-xs font-bold text-white flex items-center gap-1">
                  Código ISO <span className="text-nepsAccent">*</span>
                </label>
                <input
                  type="text"
                  id="countryCode"
                  required
                  maxLength={3}
                  placeholder="Ej. ARG"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white uppercase placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none font-mono transition-colors"
                />
                <p className="text-[11px] text-nepsMuted">Código alfa de 3 caracteres (ISO 3166-1 alpha-3).</p>
                {formErrors.code && <p className="text-[11px] text-nepsAccent">{formErrors.code}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="countryName" className="text-xs font-bold text-white flex items-center gap-1">
                  Nombre del País <span className="text-nepsAccent">*</span>
                </label>
                <input
                  type="text"
                  id="countryName"
                  required
                  placeholder="Ej. Argentina"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                />
                {formErrors.name && <p className="text-[11px] text-nepsAccent">{formErrors.name}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-nepsBorder/60">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 bg-nepsInput hover:bg-nepsBorder text-nepsMuted hover:text-white border border-nepsBorder font-semibold rounded-xl text-xs transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-nepsPrimary hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar País</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {modalMode === 'deactivate' && selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-nepsAccent/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-nepsAccent/10 border border-nepsAccent/20 flex items-center justify-center text-nepsAccent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Desactivar País</h3>
              <p className="text-xs text-nepsMuted">¿Estás seguro que deseas desactivar <strong className="text-white">{selectedCountry.name}</strong>?</p>
            </div>
            <p className="text-[11px] text-nepsAccent/90 bg-nepsAccent/10 p-2.5 rounded-lg border border-nepsAccent/20">
              El país permanecerá visible en el historial administrativo pero no estará disponible para nuevas vinculaciones. No se realizará eliminación física.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput hover:bg-nepsBorder text-nepsMuted hover:text-white border border-nepsBorder font-semibold rounded-xl text-xs transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStateChange}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsAccent hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-70"
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
                  <span>Confirmar Desactivación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'activate' && selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-nepsCard border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Activar País</h3>
              <p className="text-xs text-nepsMuted">¿Estás seguro que deseas activar <strong className="text-white">{selectedCountry.name}</strong>?</p>
            </div>
            <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
              El país volverá a estar disponible de forma inmediata en las listas activas de la plataforma.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 bg-nepsInput hover:bg-nepsBorder text-nepsMuted hover:text-white border border-nepsBorder font-semibold rounded-xl text-xs transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStateChange}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 disabled:opacity-70"
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
                  <span>Confirmar Activación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountriesPage
