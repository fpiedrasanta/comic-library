import type { WorkListListItemDto } from '@/features/work-lists/types/work-list'
import { ProtectedImage } from '@/components/protected-image'

interface WorkListsTableProps {
  workLists: WorkListListItemDto[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  onEdit: (workList: WorkListListItemDto) => void
  onDeactivate: (workList: WorkListListItemDto) => void
  onActivate: (workList: WorkListListItemDto) => void
}

export default function WorkListsTable({
  workLists,
  isLoading,
  error,
  onRetry,
  onEdit,
  onDeactivate,
  onActivate,
}: WorkListsTableProps) {
  if (isLoading && workLists.length === 0) {
    return (
      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl p-12 space-y-3 animate-pulse">
        <div className="h-8 bg-nepsInput rounded-xl w-full"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-nepsInput rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl p-12 text-center space-y-3">
        <div className="w-8 h-8 rounded-full bg-nepsAccent/10 border border-nepsAccent/20 flex items-center justify-center mx-auto text-nepsAccent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-sm font-bold text-white">Error al cargar la información</p>
        <p className="text-xs text-nepsMuted">No pudimos conectar con el servidor.</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-nepsAccent text-white font-bold rounded-xl text-xs hover:bg-rose-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (workLists.length === 0) {
    return (
      <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-white">No se encontraron listas de obras</h3>
        <p className="text-xs text-nepsMuted max-w-sm mx-auto">
          Prueba ajustando los filtros de búsqueda o agrega una nueva lista de obras.
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-nepsBorder bg-nepsInput/40 text-[11px] uppercase tracking-wider text-nepsMuted font-bold">
              <th className="py-3.5 px-6 w-16 text-center">Cover</th>
              <th className="py-3.5 px-6">Fecha de creación</th>
              <th className="py-3.5 px-6">Nombre</th>
              <th className="py-3.5 px-6">Tipo</th>
              <th className="py-3.5 px-6 text-center">Estado</th>
              <th className="py-3.5 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nepsBorder/60 text-xs">
            {workLists.map((workList) => (
              <tr
                key={workList.id}
                className={`transition-colors ${!workList.isActive ? 'opacity-60' : 'hover:bg-nepsInput/30'}`}
              >
                <td className="py-3 px-6 text-center">
                  {workList.urlCover ? (
                    <ProtectedImage
                      src={workList.urlCover}
                      alt={`Cover ${workList.name}`}
                      className="w-10 h-14 object-cover rounded-lg border border-nepsBorder mx-auto shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg border border-nepsBorder mx-auto flex items-center justify-center bg-nepsInput text-nepsMuted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-nepsMuted font-mono text-[11px]">
                  {formatDate(workList.createdAt)}
                </td>
                <td className="py-4 px-6 font-bold text-white">{workList.name}</td>
                <td className="py-4 px-6">
                  <span className="bg-nepsInput border border-nepsBorder text-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-medium">
                    {workList.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  {workList.isActive ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-emerald-400 font-bold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-slate-400 font-bold text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      Inactiva
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(workList)}
                      className="px-2.5 py-1.5 bg-nepsInput hover:bg-nepsBorder text-slate-200 rounded-lg border border-nepsBorder transition-colors font-medium text-xs"
                    >
                      Editar
                    </button>
                    {workList.isActive ? (
                      <button
                        onClick={() => onDeactivate(workList)}
                        className="px-2.5 py-1.5 bg-nepsAccent/10 hover:bg-nepsAccent hover:text-white text-nepsAccent rounded-lg border border-nepsAccent/20 transition-all font-medium text-xs"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(workList)}
                        className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-lg border border-emerald-500/20 transition-all text-xs"
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
    </div>
  )
}
