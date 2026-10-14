import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import type { CatalogWorkDetailDto, CatalogWorkContextDto } from '../types/work-detail'

/**
 * Editorial Context section: Publisher, Franchise, Series cards with colored accent bars.
 */
export function EditorialContext({ work }: { work: CatalogWorkDetailDto }) {
  const items = [
    {
      label: 'Publisher',
      entity: work.publisher,
      fallbackColor: '#ef4444', // red-500
      routePrefix: 'publishers',
    },
    {
      label: 'Franchise',
      entity: work.franchise,
      fallbackColor: '#f59e0b', // amber-500
      routePrefix: 'franchises',
    },
    {
      label: 'Series',
      entity: work.series,
      fallbackColor: '#0ea5e9', // sky-500
      routePrefix: 'series',
    },
  ].filter((item) => item.entity) as Array<{
    label: string
    entity: CatalogWorkContextDto
    fallbackColor: string
    routePrefix: string
  }>

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ label, entity, fallbackColor, routePrefix }) => (
          <Link
            key={entity.id}
            to={`/${routePrefix}/${entity.id}`}
            className="group relative flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l"
              style={{ backgroundColor: entity.color ?? fallbackColor }}
            />
            <ProtectedImage
              src={entity.urlCover ?? ''}
              alt={entity.name}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-slate-950"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {label}
              </span>
              <h3 className="text-sm font-semibold text-white group-hover:text-sky-400 transition truncate">
                {entity.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}