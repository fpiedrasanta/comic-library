/**
 * Placeholder for one list card while the first page is in flight.
 * It mirrors the real card's structure — vertical cover, type pill,
 * name, work count — so the grid does not jump when the data lands.
 */
export function ListCardSkeleton() {
  return (
    <div className="bg-neps-card border border-neps-border rounded-2xl overflow-hidden flex flex-col gap-3 p-3.5 animate-pulse">
      <div className="w-full aspect-[2/3] rounded-xl bg-neps-input" />
      <div className="h-3 w-16 bg-neps-input rounded" />
      <div className="h-4 bg-neps-input rounded w-4/5" />
      <div className="h-3 bg-neps-input rounded w-1/3 pt-2" />
    </div>
  )
}

export function ListCardSkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <ListCardSkeleton key={index} />
      ))}
    </div>
  )
}
