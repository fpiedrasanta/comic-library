interface DashboardWelcomeProps {
  firstName: string
  inProgressCount: number
  libraryCount: number
  onExploreCatalog: () => void
}

export default function DashboardWelcome({
  firstName,
  inProgressCount,
  libraryCount,
  onExploreCatalog,
}: DashboardWelcomeProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neps-card border border-neps-border rounded-2xl p-6 shadow-glow-blue">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ¡Hola de nuevo, {firstName}! 👋
        </h1>
        <p className="text-xs text-neps-muted">
          Tenés <span className="text-neps-primary font-semibold">{inProgressCount} lecturas en progreso</span> y {libraryCount} cómics guardados en tu biblioteca.
        </p>
      </div>
      <button
        type="button"
        onClick={onExploreCatalog}
        className="self-start sm:self-auto bg-neps-primary/10 border border-neps-primary/30 hover:bg-neps-primary hover:text-neps-bg text-neps-primary font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Explorar todo el catálogo
      </button>
    </div>
  )
}
