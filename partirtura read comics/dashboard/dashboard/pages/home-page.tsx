import { useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { useDashboardPageHeader } from './dashboard-layout'

function DashboardHomePage() {
  const { setPageTitle, setPageActions } = useDashboardPageHeader()

  useEffect(() => {
    setPageTitle('Consola de Administración')
    setPageActions(null)
  }, [setPageTitle, setPageActions])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-nepsCard border border-nepsBorder p-4 rounded-xl space-y-2">
          <p className="text-xs text-nepsMuted font-medium">Total de Cómics</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">—</span>
          </div>
          <p className="text-[11px] text-nepsMuted">Estadística pendiente de API.</p>
        </div>

        <div className="bg-nepsCard border border-nepsBorder p-4 rounded-xl space-y-2">
          <p className="text-xs text-nepsMuted font-medium">Usuarios Activos</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">—</span>
          </div>
          <p className="text-[11px] text-nepsMuted">Estadística pendiente de API.</p>
        </div>

        <div className="bg-nepsCard border border-nepsBorder p-4 rounded-xl space-y-2">
          <p className="text-xs text-nepsMuted font-medium">Lecturas del Mes</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">—</span>
          </div>
          <p className="text-[11px] text-nepsMuted">Estadística pendiente de API.</p>
        </div>

        <div className="bg-nepsCard border border-nepsBorder p-4 rounded-xl space-y-2">
          <p className="text-xs text-nepsMuted font-medium">Reportes Pendientes</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">—</span>
          </div>
          <p className="text-[11px] text-nepsMuted">Estadística pendiente de API.</p>
        </div>
      </div>

      <div className="bg-nepsCard border border-dashed border-nepsBorder/60 rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-nepsInput border border-nepsBorder flex items-center justify-center mx-auto text-nepsMuted">
          <BookOpen className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">Catálogo no disponible</h4>
        <p className="text-xs text-nepsMuted max-w-sm mx-auto">
          El catálogo de cómics será implementado en una próxima etapa. Por el momento esta sección se encuentra deshabilitada.
        </p>
      </div>
    </div>
  )
}

export default DashboardHomePage
