interface ReaderLoadingProps {
  label?: string
}

export function ReaderLoading({ label = 'Cargando...' }: ReaderLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-neps-card/40 border border-neps-border/50 rounded-2xl backdrop-blur-sm">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-neps-primary/20 border-t-neps-primary animate-spin" />
        <svg className="w-5 h-5 text-neps-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="text-xs font-mono text-neps-muted animate-pulse">{label}</p>
    </div>
  )
}

interface ReaderErrorProps {
  message: string
  onRetry: () => void
}

export function ReaderError({ message, onRetry }: ReaderErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-8 bg-neps-card/90 border border-neps-accent/30 rounded-2xl max-w-sm text-center shadow-2xl">
      <div className="w-12 h-12 rounded-full bg-neps-accent/10 border border-neps-accent/30 text-neps-accent flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-white">No se pudo cargar la página</h3>
      <p className="text-xs text-neps-muted leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-1.5 rounded-lg bg-neps-accent text-white text-xs font-semibold hover:bg-rose-600 transition shadow-lg shadow-neps-accent/20 flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reintentar
      </button>
    </div>
  )
}

interface ReaderEndProps {
  onReRead: () => void
}

export function ReaderEnd({ onReRead }: ReaderEndProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-neps-card/90 border border-neps-border rounded-2xl max-w-md text-center shadow-glow-blue">
      <div className="w-12 h-12 rounded-full bg-neps-primary/10 border border-neps-primary/30 text-neps-primary flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Has completado la lectura</h3>
        <p className="text-xs text-neps-muted">Llegaste a la ultima pagina de la obra.</p>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={onReRead}
          className="px-3.5 py-1.5 rounded-lg bg-neps-input border border-neps-border text-xs text-slate-300 hover:text-white transition"
        >
          Releer desde el inicio
        </button>
      </div>
    </div>
  )
}
