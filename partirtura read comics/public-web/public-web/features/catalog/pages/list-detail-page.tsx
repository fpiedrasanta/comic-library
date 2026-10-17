import { Link } from 'react-router-dom'
import { ListHeader } from '../components/list-header'
import { ListWorkRow } from '../components/list-work-row'
import { useCatalogListDetail } from '../hooks/use-list-detail'

/**
 * `/lists/:id`: the detail of an official list.
 *
 * The works render as rows, in the order the list itself defines
 * (`WorkListItem.Position`), so the page offers no work filter, no search and no
 * sorting, and never reorders what the backend delivers.
 */
export function ListDetailPage({ entityId }: { entityId: number }) {
  const { entity: list, isLoading, notFound, error } = useCatalogListDetail(entityId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-10">
      <div>
        <Link
          to="/lists"
          className="inline-flex items-center gap-1 text-xs text-neps-muted hover:text-white font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver a Exploración de Listas
        </Link>
      </div>

      <ListHeader list={list} isLoading={isLoading} notFound={notFound} error={error} />

      {!isLoading && !error && list != null && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-neps-border pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Obras de la Lista</h2>
              <span className="text-[11px] font-mono text-neps-muted bg-neps-input border border-neps-border px-2 py-0.5 rounded-md">
                Orden de lectura
              </span>
            </div>
          </div>

          {list.works.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs font-bold text-white">Esta lista todavía no tiene obras.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {list.works.map((item) => (
                <ListWorkRow key={item.work.id} work={item.work} position={item.position} listId={list.id} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
