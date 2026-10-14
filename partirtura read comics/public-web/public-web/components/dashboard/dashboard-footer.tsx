export default function DashboardFooter() {
  return (
    <footer className="border-t border-neps-border bg-neps-bg py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neps-muted">
        <div>
          &copy; 2026 Comic Library. Desarrollado por <span className="text-white font-semibold">&lt;neps/&gt;</span>
        </div>
        <div className="flex gap-6">
          <button type="button" className="hover:text-white transition-colors">
            Soporte
          </button>
          <button type="button" className="hover:text-white transition-colors">
            Términos
          </button>
        </div>
      </div>
    </footer>
  )
}
