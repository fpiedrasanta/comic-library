import { useEffect } from 'react'
import type { ListReaderListItemDto } from '../types/list-reader-context'
import { ReaderWorkListItem } from './reader-work-list-item'

interface ReaderListContext {
  listId: number
  workId: number
  works: ListReaderListItemDto[]
  onSelectWork: (workId: number) => void
}

interface ReaderMenuProps {
  isOpen: boolean
  onClose: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  /** Contextual list data. When omitted, the menu renders the individual reader layout unchanged. */
  listContext?: ReaderListContext
}

export function ReaderMenu({ isOpen, onClose, zoom, onZoomIn, onZoomOut, listContext }: ReaderMenuProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch {
      // Silently ignore fullscreen errors
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full bg-neps-card border-l border-neps-border p-5 sm:p-6 flex flex-col justify-between shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-neps-border pb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-neps-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4" />
              </svg>
              <h2 className="text-sm font-bold text-white">Ajustes de Lectura</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neps-muted hover:text-white hover:bg-neps-input transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-neps-input border border-neps-border space-y-2">
              <p className="text-xs font-semibold text-white">Nivel de Zoom</p>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={onZoomOut}
                  className="px-3 py-1.5 rounded bg-neps-card border border-neps-border text-xs text-white hover:bg-neps-border transition"
                >
                  -25%
                </button>
                <span className="text-xs font-mono text-neps-primary font-bold min-w-[50px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={onZoomIn}
                  className="px-3 py-1.5 rounded bg-neps-card border border-neps-border text-xs text-white hover:bg-neps-border transition"
                >
                  +25%
                </button>
              </div>
            </div>

          {listContext && (
            <div className="p-3 rounded-xl bg-neps-input border border-neps-border space-y-2">
              <p className="text-xs font-semibold text-white">Works de la Lista</p>
              <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
                {listContext.works.map((item) => (
                  <ReaderWorkListItem
                    key={item.work.id}
                    item={item}
                    isCurrent={item.work.id === listContext.workId}
                    onSelect={listContext.onSelectWork}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onClose()
              toggleFullscreen()
            }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-neps-input border border-neps-border hover:border-neps-primary/40 transition text-left"
            >
              <div>
                <p className="text-xs font-semibold text-white">Pantalla Completa</p>
                <p className="text-[10px] text-neps-muted">Maximizar visor en el navegador</p>
              </div>
              <svg className="w-4 h-4 text-neps-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neps-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neps-primary/10 border border-neps-primary/30 text-neps-primary text-xs font-bold hover:bg-neps-primary hover:text-neps-bg transition"
          >
            Volver a la Lectura
          </button>
        </div>
      </div>
    </div>
  )
}
