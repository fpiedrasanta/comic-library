import { Link } from 'react-router-dom'
import { WorkHeader } from '../components/work-header'
import { WorkNavigation } from '../components/work-navigation'
import { RatingList } from '../components/rating-list'
import { useWorkDetail } from '../hooks/use-work-detail'

export function WorkDetailPage({ entityId }: { entityId: number }) {
  const { entity: work, isLoading, notFound, error } = useWorkDetail(entityId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-10">
      <div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white font-medium"
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
          Volver al Catálogo
        </Link>
      </div>

      <WorkHeader work={work} isLoading={isLoading} notFound={notFound} error={error} />

      {!isLoading && !error && work != null && (
        <>
          <RatingList
            workId={work.id}
            averageRating={work.averageRating}
            ratingCount={work.ratingCount}
          />
          <WorkNavigation work={work} />
        </>
      )}
    </div>
  )
}