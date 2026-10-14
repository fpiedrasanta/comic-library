interface WorkContextDisplayProps {
  seriesName?: string | null
  franchiseName?: string | null
  publisherName?: string | null
  publisherCountryName?: string | null
}

export default function WorkContextDisplay({
  seriesName,
  franchiseName,
  publisherName,
  publisherCountryName,
}: WorkContextDisplayProps) {
  const hasContext = seriesName || franchiseName || publisherName

  if (!hasContext) {
    return null
  }

  return (
    <div className="bg-nepsInput/60 border border-nepsBorder rounded-xl px-3.5 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-nepsMuted uppercase tracking-wider">
            Contexto
          </span>
        </div>
        {seriesName && (
          <span className="text-slate-300">
            <span className="text-nepsMuted">Serie:</span> {seriesName}
          </span>
        )}
        {franchiseName && (
          <span className="text-slate-300">
            <span className="text-nepsMuted">Franquicia:</span> {franchiseName}
          </span>
        )}
        {publisherName && (
          <span className="text-slate-300">
            <span className="text-nepsMuted">Editorial:</span> {publisherName}
            {publisherCountryName ? ` (${publisherCountryName})` : ''}
          </span>
        )}
      </div>
    </div>
  )
}
