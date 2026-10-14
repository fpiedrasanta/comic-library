import { ReaderPageIndicator } from './reader-page-indicator'

interface ReaderFooterProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onFirst: () => void
  onLast: () => void
  previousWork: { id: number; title: string; numberValue: string | null } | null
  nextWork: { id: number; title: string; numberValue: string | null } | null
  onPreviousWork: () => void
  onNextWork: () => void
  isLastPosition: boolean
}

export function ReaderFooter({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onFirst,
  onLast,
  previousWork,
  nextWork,
  onPreviousWork,
  onNextWork,
  isLastPosition,
}: ReaderFooterProps) {
  return (
    <footer className="relative z-30 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 bg-neps-card/90 border-t border-neps-border/80 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-1">
        <button
          onClick={onFirst}
          className="p-1.5 rounded-lg text-neps-muted hover:text-white hover:bg-neps-input transition hidden sm:flex"
          title="Primera página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onPrev}
          className="p-1.5 rounded-lg text-neps-muted hover:text-white hover:bg-neps-input transition"
          title="Página anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <ReaderPageIndicator
        currentPage={currentPage}
        totalPages={totalPages}
        isFirstPage={currentPage === 1}
        isLastPage={isLastPosition}
        previousWork={previousWork}
        nextWork={nextWork}
        onPreviousWork={onPreviousWork}
        onNextWork={onNextWork}
      />

      <div className="flex items-center gap-1">
        <button
          onClick={onNext}
          className="p-1.5 rounded-lg text-neps-muted hover:text-white hover:bg-neps-input transition"
          title="Página siguiente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={onLast}
          className="p-1.5 rounded-lg text-neps-muted hover:text-white hover:bg-neps-input transition hidden sm:flex"
          title="Última página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </footer>
  )
}