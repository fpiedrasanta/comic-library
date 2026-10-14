import { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getWorksByPublisher } from '@/features/works/services/works.service'
import { getPublisher } from '@/features/publishers/services/publisher.service'
import WorksListing from '@/features/works/components/works-listing'
import { ProtectedImage } from '@/components/protected-image'
import type { ContentStatus } from '@/types/works'

function PublisherWorksPage() {
  const { publisherId: publisherIdParam } = useParams<{ publisherId?: string }>()
  const parsedPublisherId = publisherIdParam ? Number(publisherIdParam) : Number.NaN
  const publisherId = Number.isInteger(parsedPublisherId) && parsedPublisherId > 0 ? parsedPublisherId : undefined

  const { data: publisher } = useQuery({
    queryKey: ['publisher', publisherId],
    queryFn: () => getPublisher(Number(publisherId)),
    enabled: publisherId !== undefined,
  })

  const queryKeyBase = useMemo(() => ['publisher-works', { publisherId }], [publisherId])

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      if (publisher) {
        breadcum.innerHTML = `Dashboard &gt; Gestionar editoriales &gt; ${publisher.name}`
      } else {
        breadcum.innerHTML = 'Dashboard &gt; Gestionar editoriales'
      }
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [publisher])

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
    }) => getWorksByPublisher(Number(publisherId), params),
    [publisherId],
  )

  const contextInfo = publisher ? (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-nepsPrimary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-4">
        {publisher.urlImage && (
          <ProtectedImage
            src={publisher.urlImage}
            alt={publisher.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-nepsBorder shadow-md bg-nepsInput flex-shrink-0"
          />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] bg-nepsInput text-slate-300 px-2 py-0.5 rounded font-medium border border-nepsBorder">
              Editorial
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${publisher.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-nepsInput text-slate-300 border-nepsBorder'}`}>
              {publisher.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{publisher.name}</h2>
          <p className="text-xs text-nepsMuted">Gestión de obras de la editorial.</p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <WorksListing
      createApiFn={createApiFn}
      queryKeyBase={queryKeyBase}
      pageTitle={publisher ? `Obras — ${publisher.name}` : 'Obras de la Editorial'}
      contextInfo={contextInfo}
      showCreateButton={!!publisherId}
      createButtonLabel="Nueva Obra"
      createButtonPath={publisherId ? `/publishers/${publisherId}/works/create` : '/works/create'}
      createButtonContext={publisherId ? { publisherId } : undefined}
      backPath={publisherId ? `/publishers/${publisherId}/works` : '/publishers'}
      contextName={publisher?.name}
      contextId={publisherId}
      contextType="publisher"
    />
  )
}

export default PublisherWorksPage
