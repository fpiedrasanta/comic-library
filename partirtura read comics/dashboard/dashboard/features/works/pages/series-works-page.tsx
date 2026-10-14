import { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getWorksBySeries } from '@/features/works/services/works.service'
import { getSeriesById } from '@/features/series/services/series.service'
import WorksListing from '@/features/works/components/works-listing'
import { ProtectedImage } from '@/components/protected-image'
import type { ContentStatus } from '@/types/works'

function SeriesWorksPage() {
  const { seriesId: seriesIdParam } = useParams<{ seriesId?: string }>()
  const parsedSeriesId = seriesIdParam ? Number(seriesIdParam) : Number.NaN
  const seriesId = Number.isInteger(parsedSeriesId) && parsedSeriesId > 0 ? parsedSeriesId : undefined

  const { data: seriesData } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => getSeriesById(Number(seriesId)),
    enabled: seriesId !== undefined,
  })

  const queryKeyBase = useMemo(() => ['series-works', { seriesId }], [seriesId])

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      if (seriesData) {
        breadcum.innerHTML = `Dashboard &gt; Gestionar series &gt; ${seriesData.name}`
      } else {
        breadcum.innerHTML = 'Dashboard &gt; Gestionar series'
      }
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [seriesData])

  const createApiFn = useMemo(
    () => (params: {
      currentPage: number
      pageSize: number
      search: string
      orderBy: string
      orderDir: string
      isActive?: boolean
      contentStatus?: ContentStatus
      publicationDateFrom?: string
      publicationDateTo?: string
      iaRequest?: boolean
      iaStatus?: number
      withDescription?: boolean
    }) => getWorksBySeries(Number(seriesId), params),
    [seriesId],
  )

  const contextInfo = seriesData ? (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-nepsPrimary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-4">
        {seriesData.urlImage && (
          <ProtectedImage
            src={seriesData.urlImage}
            alt={seriesData.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-nepsBorder shadow-md bg-nepsInput flex-shrink-0"
          />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {seriesData.publisherName && (
              <span className="text-[10px] bg-nepsInput text-slate-300 px-2 py-0.5 rounded font-medium border border-nepsBorder">
                {seriesData.publisherName}
              </span>
            )}
            {seriesData.franchiseName && (
              <span className="text-[10px] bg-nepsInput text-slate-300 px-2 py-0.5 rounded font-medium border border-nepsBorder">
                {seriesData.franchiseName}
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${seriesData.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-nepsInput text-slate-300 border-nepsBorder'}`}>
              {seriesData.isActive ? 'Serie Activa' : 'Serie Inactiva'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{seriesData.name}</h2>
          <p className="text-xs text-nepsMuted">Gestión de obras de la serie.</p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <WorksListing
      createApiFn={createApiFn}
      queryKeyBase={queryKeyBase}
      pageTitle={seriesData ? `Obras — ${seriesData.name}` : 'Obras de la Serie'}
      contextInfo={contextInfo}
      showCreateButton={!!seriesId}
      createButtonLabel="Nuevo Número"
      createButtonPath={seriesId ? `/series/${seriesId}/works/create` : '/works/create'}
      createButtonContext={seriesId ? { seriesId } : undefined}
      backPath={seriesId ? `/series/${seriesId}/works` : '/series'}
      contextName={seriesData?.name}
      contextId={seriesId}
      contextType="series"
    />
  )
}

export default SeriesWorksPage
