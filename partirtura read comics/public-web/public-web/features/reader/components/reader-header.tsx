import { useNavigate } from 'react-router-dom'

interface ReaderHeaderProps {
  workId: number
  zoom: number
  onToggleMenu: () => void
  onToggleFullscreen: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function ReaderHeader({ workId, zoom, onToggleMenu, onToggleFullscreen, onZoomIn, onZoomOut }: ReaderHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="relative z-30 flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 bg-neps-card/90 border-b border-neps-border/80 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => navigate(`/works/${workId}`)}
          className="p-1.5 rounded-lg border border-neps-primary/40 text-neps-primary hover:bg-neps-primary hover:text-white transition-colors flex-shrink-0"
          title="Volver al detalle"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-neps-input border border-neps-border px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-300 shadow-inner">
        <button
          onClick={onZoomOut}
          className="p-1 rounded text-neps-muted hover:text-white transition"
          title="Reducir zoom"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-[10px] font-mono text-neps-primary font-bold px-1 min-w-[40px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1 rounded text-neps-muted hover:text-white transition"
          title="Aumentar zoom"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg bg-neps-primary/10 border border-neps-primary/30 text-neps-primary hover:bg-neps-primary hover:text-white transition"
          title="Pantalla completa"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <button
          onClick={onToggleMenu}
          className="p-2 rounded-lg bg-neps-primary/10 border border-neps-primary/30 text-neps-primary hover:bg-neps-primary hover:text-white transition"
          title="Menu de Reader"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>
    </header>
  )
}
