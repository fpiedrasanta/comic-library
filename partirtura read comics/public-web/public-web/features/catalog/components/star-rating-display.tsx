export function StarRatingDisplay({ averageRating, maxStars = 5, size = 16, showValue = false }: {
  averageRating: number | null
  maxStars?: number
  size?: number
  showValue?: boolean
}) {
  if (averageRating === null) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-400">
        <span className="text-xs">Sin valoraciones</span>
      </span>
    )
  }

  const stars: Array<'full' | 'half' | 'empty'> = []
  const fullStars = Math.floor(averageRating)
  const hasHalfStar = averageRating - fullStars >= 0.25

  for (let i = 0; i < fullStars; i++) stars.push('full')
  if (hasHalfStar && stars.length < maxStars) stars.push('half')
  while (stars.length < maxStars) stars.push('empty')

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Valoración promedio: ${averageRating.toFixed(1)} de 5`}>
      {stars.map((star, i) => (
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      ))}
      {showValue && (
        <span className="text-xs font-medium text-slate-300 ml-1">{averageRating.toFixed(1)}</span>
      )}
    </span>
  )
}