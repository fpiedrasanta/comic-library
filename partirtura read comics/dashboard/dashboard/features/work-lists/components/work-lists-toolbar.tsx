import { Search } from 'lucide-react'
import FranchiseSearchSelect from '@/features/series/components/franchise-search-select'
import PublisherSearchSelect from '@/features/series/components/publisher-search-select'
import ListTypeSearchSelect from '@/features/list-types/components/list-type-search-select'

interface WorkListsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isActiveFilter: boolean | undefined
  onIsActiveFilterChange: (value: boolean | undefined) => void
  franchiseFilter: number | undefined
  onFranchiseFilterChange: (value: number | undefined) => void
  publisherFilter: number | undefined
  onPublisherFilterChange: (value: number | undefined) => void
  listTypeFilter: number | undefined
  onListTypeFilterChange: (value: number | undefined) => void
  createdAtFrom: string
  onCreatedAtFromChange: (value: string) => void
  createdAtTo: string
  onCreatedAtToChange: (value: string) => void
  sortField: 'name' | 'createdAt'
  onSortFieldChange: (value: 'name' | 'createdAt') => void
  sortDir: 'asc' | 'desc'
  onSortDirChange: (value: 'asc' | 'desc') => void
}

export default function WorkListsToolbar({
  search,
  onSearchChange,
  isActiveFilter,
  onIsActiveFilterChange,
  franchiseFilter,
  onFranchiseFilterChange,
  publisherFilter,
  onPublisherFilterChange,
  listTypeFilter,
  onListTypeFilterChange,
  createdAtFrom,
  onCreatedAtFromChange,
  createdAtTo,
  onCreatedAtToChange,
  sortField,
  onSortFieldChange,
  sortDir,
  onSortDirChange,
}: WorkListsToolbarProps) {
  return (
    <div className="bg-nepsCard border border-nepsBorder p-4 rounded-2xl space-y-4">
      <div className="relative w-full">
        <Search className="w-4 h-4 text-nepsMuted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre de lista, título de obra o número..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
        />
      </div>
      <p className="text-[10px] text-nepsMuted flex items-center gap-1 pl-1">
        <Search className="w-3 h-3 text-nepsPrimary flex-shrink-0" />
        <span>
          La búsqueda contempla: <strong>nombre de la lista</strong>, <strong>título de obra</strong> o
          <strong> número de obra</strong>.
        </span>
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3 border-t border-nepsBorder/60">
        <div className="space-y-1 col-span-2 sm:col-span-1">
          <FranchiseSearchSelect
            label="Franquicia"
            value={franchiseFilter}
            onChange={onFranchiseFilterChange}
          />
        </div>

        <div className="space-y-1 col-span-2 sm:col-span-1">
          <PublisherSearchSelect
            label="Editorial"
            value={publisherFilter}
            onChange={onPublisherFilterChange}
          />
        </div>

        <div className="space-y-1 col-span-2 sm:col-span-1">
          <ListTypeSearchSelect
            label="Tipo de lista"
            value={listTypeFilter}
            onChange={onListTypeFilterChange}
            allLabel="Todos los tipos"
            placeholder="Buscar tipo de lista..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Estado</label>
          <select
            value={isActiveFilter === undefined ? 'todos' : isActiveFilter ? 'activo' : 'inactivo'}
            onChange={(e) => {
              const val = e.target.value
              onIsActiveFilterChange(val === 'todos' ? undefined : val === 'activo')
            }}
            className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Fecha Desde</label>
          <input
            type="date"
            value={createdAtFrom}
            onChange={(e) => onCreatedAtFromChange(e.target.value)}
            className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2 py-1 outline-none focus:border-nepsPrimary [color-scheme:dark]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Fecha Hasta</label>
          <input
            type="date"
            value={createdAtTo}
            onChange={(e) => onCreatedAtToChange(e.target.value)}
            className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2 py-1 outline-none focus:border-nepsPrimary [color-scheme:dark]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Ordenar por</label>
          <select
            value={sortField}
            onChange={(e) => onSortFieldChange(e.target.value as 'name' | 'createdAt')}
            className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary truncate"
          >
            <option value="createdAt">Fecha creación</option>
            <option value="name">Nombre</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider block">Sentido</label>
          <select
            value={sortDir}
            onChange={(e) => onSortDirChange(e.target.value as 'asc' | 'desc')}
            className="w-full bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>
    </div>
  )
}
