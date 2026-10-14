import { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getWorksByFranchise } from '@/features/works/services/works.service'
import { getFranchiseById } from '@/features/franchises/services/franchise.service'
import WorksListing from '@/features/works/components/works-listing'
import { ProtectedImage } from '@/components/protected-image'
import type { ContentStatus } from '@/types/works'

function FranchiseWorksPage() {
  const { franchiseId: franchiseIdParam } = useParams<{ franchiseId?: string }>()
  const parsedFranchiseId = franchiseIdParam ? Number(franchiseIdParam) : Number.NaN
  const franchiseId = Number.isInteger(parsedFranchiseId) && parsedFranchiseId > 0 ? parsedFranchiseId : undefined

  const { data: franchise } = useQuery({
    queryKey: ['franchise', franchiseId],
    queryFn: () => getFranchiseById(Number(franchiseId)),
    enabled: franchiseId !== undefined,
  })

  const queryKeyBase = useMemo(() => ['franchise-works', { franchiseId }], [franchiseId])

  useEffect(() => {
    const breadcum = document.getElementById('breadcum')
    if (breadcum) {
      if (franchise) {
        breadcum.innerHTML = `Dashboard &gt; Gestionar franquicias &gt; ${franchise.name}`
      } else {
        breadcum.innerHTML = 'Dashboard &gt; Gestionar franquicias'
      }
    }
    return () => {
      const breadcum = document.getElementById('breadcum')
      if (breadcum) {
        breadcum.innerHTML = 'Dashboard'
      }
    }
  }, [franchise])

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
    }) => getWorksByFranchise(Number(franchiseId), params),
    [franchiseId],
  )

  const contextInfo = franchise ? (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-nepsPrimary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-4">
        {franchise.imageId && (
          <ProtectedImage
            src={`/images/${franchise.imageId}`}
            alt={franchise.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-nepsBorder shadow-md bg-nepsInput flex-shrink-0"
          />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] bg-nepsInput text-slate-300 px-2 py-0.5 rounded font-medium border border-nepsBorder">
              Franquicia
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${franchise.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-nepsInput text-slate-300 border-nepsBorder'}`}>
              {franchise.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{franchise.name}</h2>
          <p className="text-xs text-nepsMuted">Gestión de obras de la franquicia.</p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <WorksListing
      createApiFn={createApiFn}
      queryKeyBase={queryKeyBase}
      pageTitle={franchise ? `Obras — ${franchise.name}` : 'Obras de la Franquicia'}
      contextInfo={contextInfo}
      showCreateButton={!!franchiseId}
      createButtonLabel="Nueva Obra"
      createButtonPath={franchiseId ? `/franchises/${franchiseId}/works/create` : '/works/create'}
      createButtonContext={franchiseId ? { franchiseId } : undefined}
      backPath={franchiseId ? `/franchises/${franchiseId}/works` : '/franchises'}
      contextName={franchise?.name}
      contextId={franchiseId}
      contextType="franchise"
    />
  )
}

export default FranchiseWorksPage
