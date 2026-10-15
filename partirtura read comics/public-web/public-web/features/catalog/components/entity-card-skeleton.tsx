/**
 * Placeholder for one card while the first page is in flight. It mirrors the
 * real card's structure so the grid does not jump when the data lands.
 */
export function EntityCardSkeleton() {
  return (
    <div className="bg-neps-card border border-neps-border rounded-2xl p-3 flex flex-col gap-3 animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-neps-input" />
      <div className="flex gap-1">
        <div className="h-3 w-14 bg-neps-input rounded" />
        <div className="h-3 w-14 bg-neps-input rounded" />
      </div>
      <div className="h-4 bg-neps-input rounded w-3/4" />
    </div>
  )
}

export function EntityCardSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }, (_, index) => (
        <EntityCardSkeleton key={index} />
      ))}
    </div>
  )
}
