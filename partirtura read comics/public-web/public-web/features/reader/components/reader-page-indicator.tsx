interface ReaderPageIndicatorProps {
  currentPage: number
  totalPages: number
  isFirstPage: boolean
  isLastPage: boolean
  previousWork: { id: number; title: string; numberValue: string | null } | null
  nextWork: { id: number; title: string; numberValue: string | null } | null
  onPreviousWork: () => void
  onNextWork: () => void
}

export function ReaderPageIndicator({
  currentPage,
  totalPages,
  isFirstPage,
  isLastPage,
  previousWork,
  nextWork,
  onPreviousWork,
  onNextWork,
}: ReaderPageIndicatorProps) {
  // Primera página con PreviousWork
  if (isFirstPage && previousWork) {
    const numberPart = previousWork.numberValue ? ` - ${previousWork.numberValue}` : ''
    return (
      <button
        onClick={onPreviousWork}
        className="flex items-center gap-2 bg-neps-input border border-neps-border px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-300 shadow-inner hover:border-neps-primary/50 hover:text-white transition"
        title="Ir a la Work anterior"
      >
        <svg className="w-3.5 h-3.5 text-neps-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="whitespace-nowrap">
          <span className="text-neps-primary">anterior</span>{numberPart} - {previousWork.title}
        </span>
      </button>
    )
  }

  // Última página con NextWork
  if (isLastPage && nextWork) {
    const numberPart = nextWork.numberValue ? ` - ${nextWork.numberValue}` : ''
    return (
      <button
        onClick={onNextWork}
        className="flex items-center gap-2 bg-neps-input border border-neps-border px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-300 shadow-inner hover:border-neps-primary/50 hover:text-white transition"
        title="Ir a la Work siguiente"
      >
        <span className="whitespace-nowrap">
          <span className="text-neps-primary">siguiente</span>{numberPart} - {nextWork.title}
        </span>
        <svg className="w-3.5 h-3.5 text-neps-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )
  }

  // Indicador normal
  return (
    <div className="flex items-center gap-2 bg-neps-input border border-neps-border px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-300 shadow-inner">
      <span className="w-1.5 h-1.5 rounded-full bg-neps-primary flex-shrink-0" />
      <span className="whitespace-nowrap">
        Página <span className="font-bold text-white">{currentPage}</span> de <span className="text-neps-muted">{totalPages}</span>
      </span>
    </div>
  )
}