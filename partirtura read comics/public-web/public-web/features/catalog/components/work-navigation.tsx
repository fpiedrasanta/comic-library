import { Link } from 'react-router-dom'
import { ProtectedImage } from '@/components/protected-image'
import type { CatalogWorkDetailDto, CatalogWorkNavigationDto } from '../types/work-detail'

function getWorkUrl(work: CatalogWorkNavigationDto | null): string {
  if (!work) return '#'
  return `/works/${work.id}`
}

/**
 * Previous / Next navigation at the bottom of the page.
 * Previous on the left, Next on the right.
 */
export function WorkNavigation({ work }: { work: CatalogWorkDetailDto }) {
  const prev = work.previousWork
  const next = work.nextWork

  if (!prev && !next) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white tracking-tight">Secuencia de Publicación</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Work - Left aligned */}
        {prev ? (
          <Link
            to={getWorkUrl(prev)}
            className="group flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 transition"
          >
            <svg className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <ProtectedImage
              src={prev.urlCover ?? ''}
              alt={prev.title}
              className="w-12 h-18 aspect-[2/3] object-cover rounded-md flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Anterior</span>
                {prev.numberValue && (
                  <span className="text-xs font-mono font-bold text-amber-400">Nº {prev.numberValue}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-sky-400 transition truncate">
                {prev.title}
              </h3>
            </div>
          </Link>
        ) : (
          <div className="sm:col-span-2" />
        )}

        {/* Next Work - Right aligned */}
        {next ? (
          <Link
            to={getWorkUrl(next)}
            className="group flex items-center justify-end text-right gap-4 p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 transition"
          >
            <div className="min-w-0">
              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                {next.numberValue && (
                  <span className="text-xs font-mono font-bold text-amber-400">Nº {next.numberValue}</span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Siguiente</span>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-sky-400 transition truncate">
                {next.title}
              </h3>
            </div>
            <ProtectedImage
              src={next.urlCover ?? ''}
              alt={next.title}
              className="w-12 h-18 aspect-[2/3] object-cover rounded-md flex-shrink-0"
            />
            <svg className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <div className="sm:col-span-2" />
        )}
      </div>
    </div>
  )
}