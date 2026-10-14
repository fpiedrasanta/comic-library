import { useState, useEffect, useCallback } from 'react'
import { useWorkRatings } from '../hooks/use-ratings'
import { StarRatingDisplay } from './star-rating-display'
import { ProtectedImage } from '@/components/protected-image'
import type { WorkRatingListItemDto } from '../api/ratings-repository'

type OrderBy = 'Stars' | 'CreatedAt'
type OrderDir = 'ASC' | 'DESC'

interface RatingListProps {
  workId: number
  averageRating: number | null
  ratingCount: number
}

const ORDER_OPTIONS = [
  { value: 'Stars' as OrderBy, dir: 'DESC' as OrderDir, label: 'Mejor puntuado' },
  { value: 'Stars' as OrderBy, dir: 'ASC' as OrderDir, label: 'Peor puntuado' },
  { value: 'CreatedAt' as OrderBy, dir: 'DESC' as OrderDir, label: 'Más recientes' },
  { value: 'CreatedAt' as OrderBy, dir: 'ASC' as OrderDir, label: 'Más antiguos' },
]

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function StarRatingItem({ stars, size = 14 }: { stars: number | null; size?: number }) {
  if (stars === null || stars === 0) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label="Sin puntuación">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="text-slate-600" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </span>
    )
  }

  const fullStars = Math.floor(stars)
  const hasHalfStar = stars - fullStars >= 0.5
  const starsArray: Array<'full' | 'half' | 'empty'> = []

  for (let i = 0; i < fullStars; i++) starsArray.push('full')
  if (hasHalfStar && starsArray.length < 5) starsArray.push('half')
  while (starsArray.length < 5) starsArray.push('empty')

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${stars} de 5 estrellas`}>
      {starsArray.map((star, i) => (
        <svg
          key={i}
          className={`flex-shrink-0 ${star === 'empty' ? 'text-slate-600' : 'text-amber-400'}`}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star === 'empty' ? 'none' : 'currentColor'}
          stroke="currentColor"
          strokeWidth={star === 'empty' ? 1.5 : 0}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function RatingItem({ rating }: { rating: WorkRatingListItemDto }) {
  return (
    <article className="space-y-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {rating.urlAvatar ? (
            <ProtectedImage
              src={rating.urlAvatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center ring-1 ring-slate-700">
              <span className="text-xs font-medium text-slate-400">{rating.userName.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{rating.userName}</span>
            <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(rating.createdAt)}</span>
          </div>
          <div className="mt-1">
            <StarRatingItem stars={rating.stars} />
          </div>
          {rating.review && (
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{rating.review}</p>
          )}
        </div>
      </div>
    </article>
  )
}

export function RatingList({ workId, averageRating, ratingCount }: RatingListProps) {
  const [orderBy, setOrderBy] = useState<OrderBy>('CreatedAt')
  const [orderDir, setOrderDir] = useState<OrderDir>('DESC')
  const [currentPage, setCurrentPage] = useState(1)
  const [allRatings, setAllRatings] = useState<WorkRatingListItemDto[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data, isLoading, error } = useWorkRatings(workId, {
    currentPage,
    pageSize: 12,
    orderBy,
    orderDir,
  })

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      setCurrentPage((prev) => prev + 1)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore])

  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        setAllRatings(data.items)
      } else {
        setAllRatings((prev) => [...prev, ...data.items])
      }
      setHasMore(data.hasNextPage)
    }
  }, [data, currentPage])

  const handleOrderChange = (newOrderBy: OrderBy, newOrderDir: OrderDir) => {
    setOrderBy(newOrderBy)
    setOrderDir(newOrderDir)
    setCurrentPage(1)
    setAllRatings([])
  }

  if (isLoading && currentPage === 1) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error && currentPage === 1) {
    return (
      <div className="text-center py-8 text-slate-400 border border-slate-800 rounded-xl bg-slate-900/50">
        No se pudieron cargar las valoraciones
      </div>
    )
  }

  const hasRatings = allRatings.length > 0

  return (
    <div className="space-y-6">
      {/* Average Rating Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center gap-3">
          <StarRatingDisplay averageRating={averageRating} size={24} showValue />
          <span className="text-sm text-slate-400">{ratingCount} voto{ratingCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Sort Selector */}
        <select
          value={`${orderBy}:${orderDir}`}
          onChange={(e) => {
            const [newOrderBy, newOrderDir] = e.target.value.split(':') as [OrderBy, OrderDir]
            handleOrderChange(newOrderBy, newOrderDir)
          }}
          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none bg-no-repeat bg-right pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5rem 1.5rem' }}
        >
          {ORDER_OPTIONS.map((opt) => (
            <option key={`${opt.value}:${opt.dir}`} value={`${opt.value}:${opt.dir}`}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ratings List */}
      {hasRatings ? (
        <div className="space-y-4">
          {allRatings.map((rating) => (
            <RatingItem key={rating.id} rating={rating} />
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent" />
                  Cargando...
                </>
              ) : (
                'Ver más'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border border-slate-800 rounded-xl bg-slate-900/50">
          <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-slate-400">No hay valoraciones aún</p>
          <p className="text-xs text-slate-500 mt-1">Sé el primero en valorar esta obra</p>
        </div>
      )}
    </div>
  )
}