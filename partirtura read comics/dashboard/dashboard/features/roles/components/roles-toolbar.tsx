import { Search } from 'lucide-react'

interface RolesToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isActiveFilter: boolean | undefined
  onIsActiveFilterChange: (value: boolean | undefined) => void
  sortDir: 'asc' | 'desc'
  onSortDirChange: (value: 'asc' | 'desc') => void
}

export default function RolesToolbar({
  search,
  onSearchChange,
  isActiveFilter,
  onIsActiveFilterChange,
  sortDir,
  onSortDirChange,
}: RolesToolbarProps) {
  return (
    <div className="bg-nepsCard border border-nepsBorder p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-80">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-nepsInput border border-nepsBorder focus:border-nepsPrimary text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
        />
        <Search className="w-4 h-4 text-nepsMuted absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
        <div className="flex items-center gap-2">
          <label className="text-nepsMuted text-[11px] font-medium">Estado:</label>
          <select
            value={isActiveFilter === undefined ? 'todos' : isActiveFilter ? 'activo' : 'inactivo'}
            onChange={(e) => {
              const val = e.target.value
              onIsActiveFilterChange(val === 'todos' ? undefined : val === 'activo')
            }}
            className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-nepsMuted text-[11px] font-medium">Ordenar por:</label>
          <select
            value={sortDir}
            onChange={(e) => onSortDirChange(e.target.value as 'asc' | 'desc')}
            className="bg-nepsInput border border-nepsBorder text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-nepsPrimary"
          >
            <option value="asc">Nombre (A-Z)</option>
            <option value="desc">Nombre (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
