import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReaderStore } from '../stores/reader-store'
import { useWorkPages } from '../hooks/use-work-pages'
import { useProtectedImage } from '@/hooks/use-protected-image'
import { useUpdateReadingProgress } from '../hooks/use-reading-progress'
import { useNormalizeCurrentPage } from '../hooks/use-normalize-current-page'
import { ReaderHeader } from './reader-header'
import { ReaderFooter } from './reader-footer'
import { ReaderMenu } from './reader-menu'
import { ReaderLoading, ReaderError } from './reader-states'
import { RatingForm } from './rating-form'

interface ReaderProps {
  workId: number
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

export function Reader({ workId }: ReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'error'>('normal')
  const [pageError, setPageError] = useState<string | null>(null)
  const [userZoom, setUserZoom] = useState(1)
  const [displayDimensions, setDisplayDimensions] = useState<{ width: number; height: number } | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [imageReady, setImageReady] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null)
  const pointerMovedRef = useRef(false)

  const navigate = useNavigate()
  const { data, isLoading, error, isFetching } = useWorkPages(workId)
  const pages = data?.pages ?? []
  const totalPages = pages.length + 1 // +1 for rating form page
  const currentPage = currentPageIndex < pages.length ? pages[currentPageIndex] : null
  const currentPageUrl = currentPage?.url ?? null
  const resolvedImageUrl = useProtectedImage(currentPageUrl)
  const myRating = data?.myRating ?? null

  const previousWork = data?.previousWork ?? null
  const nextWork = data?.nextWork ?? null
  const backendCurrentPage = data?.currentPage ?? null

  const mutateProgress = useUpdateReadingProgress(workId)
  const normalizeCurrentPage = useNormalizeCurrentPage()

  const isMenuOpen = useReaderStore((s) => s.isMenuOpen)
  const setMenuOpen = useReaderStore((s) => s.setMenuOpen)

  const displayedWidth = displayDimensions?.width ?? 0
  const displayedHeight = displayDimensions?.height ?? 0

  const persistCurrentPage = useCallback((index: number) => {
    // index es 0-based; el Backend usa 1-based
    mutateProgress.mutate(index + 1)
  }, [mutateProgress])

  // Resetear estado cuando cambia de Work
  useEffect(() => {
    setCurrentPageIndex(0)
    setInitialized(false)
    setDisplayDimensions(null)
    setImageReady(false)
    setIsTransitioning(false)
    setViewState('normal')
    setPageError(null)
  }, [workId])

  useEffect(() => {
    if (!data || initialized) return
    const normalized = normalizeCurrentPage(backendCurrentPage, totalPages)
    setCurrentPageIndex(normalized)
    persistCurrentPage(normalized)
    setInitialized(true)
  }, [data, initialized, backendCurrentPage, totalPages, normalizeCurrentPage, persistCurrentPage])

  const navigateTo = useCallback((index: number) => {
    if (index < 0 || index >= totalPages) return
    if (index === currentPageIndex) return

    setViewState('normal')
    setPageError(null)
    setCurrentPageIndex(index)
    setDisplayDimensions(null)
    setImageReady(false)
    setIsTransitioning(true)
    persistCurrentPage(index)

    if (containerRef.current) {
      containerRef.current.scrollLeft = 0
      containerRef.current.scrollTop = 0
    }
  }, [currentPageIndex, totalPages, persistCurrentPage])

  const goNext = useCallback(() => {
    if (currentPageIndex >= totalPages - 1) return
    navigateTo(currentPageIndex + 1)
  }, [currentPageIndex, totalPages, navigateTo])

  const goPrev = useCallback(() => {
    if (currentPageIndex <= 0) return
    navigateTo(currentPageIndex - 1)
  }, [currentPageIndex, navigateTo])

  const goFirst = useCallback(() => {
    if (currentPageIndex === 0) return
    navigateTo(0)
  }, [currentPageIndex, navigateTo])

  const goLast = useCallback(() => {
    if (currentPageIndex >= totalPages - 1) return
    navigateTo(totalPages - 1)
  }, [currentPageIndex, totalPages, navigateTo])

  const handleRatingClose = useCallback(() => {
    navigate(`/works/${workId}`)
  }, [workId, navigate])

  const goPreviousWork = useCallback(() => {
    if (!previousWork) return
    navigate(`/works/${previousWork.id}/read`)
  }, [previousWork, navigate])

  const goNextWork = useCallback(() => {
    if (!nextWork) return
    navigate(`/works/${nextWork.id}/read`)
  }, [nextWork, navigate])

  const adjustZoom = useCallback((delta: number) => {
    setUserZoom((prev) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta))
      return Number(next.toFixed(2))
    })
  }, [])

  const handleImageError = useCallback(() => {
    setViewState('error')
    setImageReady(false)
    setIsTransitioning(false)
    setPageError('No se pudo cargar la imagen de la pagina.')
  }, [])

  const handleRetry = useCallback(() => {
    setViewState('loading')
    setImageReady(false)
    setIsTransitioning(false)
    setPageError(null)
    setTimeout(() => {
      setViewState('normal')
    }, 800)
  }, [])

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const container = containerRef.current
    const naturalWidth = img.naturalWidth
    const naturalHeight = img.naturalHeight

    const containerWidth = container?.clientWidth ?? 0
    if (containerWidth > 0 && naturalWidth > 0) {
      const baseZoom = containerWidth / naturalWidth
      setDisplayDimensions({
        width: naturalWidth * baseZoom * userZoom,
        height: naturalHeight * baseZoom * userZoom,
      })
    } else {
      setDisplayDimensions({ width: naturalWidth * userZoom, height: naturalHeight * userZoom })
    }

    if (container) {
      container.scrollLeft = 0
      container.scrollTop = 0
    }

    setImageReady(true)
    setIsTransitioning(false)
  }, [userZoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !displayDimensions) return

    const observer = new ResizeObserver(() => {
      const containerWidth = container.clientWidth
      const naturalWidth = displayDimensions.width / userZoom // approximate natural width
      if (containerWidth <= 0 || naturalWidth <= 0) return
      const baseZoom = containerWidth / naturalWidth
      setDisplayDimensions({
        width: naturalWidth * baseZoom * userZoom,
        height: (displayDimensions.height / displayDimensions.width) * naturalWidth * baseZoom * userZoom,
      })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [displayDimensions, userZoom])

  const scrollBy = useCallback((dx: number, dy: number) => {
    const container = containerRef.current
    if (!container) return
    container.scrollBy({ top: dy, left: dx, behavior: 'smooth' })
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    } catch {
      // Silently ignore fullscreen errors
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen) return
      const tag = document.activeElement?.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          scrollBy(80, 0)
          break
        case 'ArrowLeft':
          e.preventDefault()
          scrollBy(-80, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          scrollBy(0, 80)
          break
        case 'ArrowUp':
          e.preventDefault()
          scrollBy(0, -80)
          break
        case 'Home':
          e.preventDefault()
          goFirst()
          break
        case 'End':
          e.preventDefault()
          goLast()
          break
        case '+':
        case '=':
          e.preventDefault()
          adjustZoom(ZOOM_STEP)
          break
        case '-':
          e.preventDefault()
          adjustZoom(-ZOOM_STEP)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [scrollBy, goFirst, goLast, adjustZoom, isMenuOpen])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = -e.deltaY * 0.001
        adjustZoom(delta)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [adjustZoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        dragStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          scrollLeft: container.scrollLeft,
          scrollTop: container.scrollTop,
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && dragStartRef.current) {
        const dx = e.touches[0].clientX - dragStartRef.current.x
        const dy = e.touches[0].clientY - dragStartRef.current.y
        container.scrollLeft = dragStartRef.current.scrollLeft - dx
        container.scrollTop = dragStartRef.current.scrollTop - dy
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1 && dragStartRef.current) {
        const target = e.target as HTMLElement
        if (target.closest('button')) {
          dragStartRef.current = null
          return
        }
        const touch = e.changedTouches[0]
        const dx = touch.clientX - dragStartRef.current.x
        const dy = touch.clientY - dragStartRef.current.y
        const absX = Math.abs(dx)
        const absY = Math.abs(dy)

        if (absX < 10 && absY < 10) {
          const rect = container.getBoundingClientRect()
          const relX = touch.clientX - rect.left
          const relWidth = rect.width
          if (relX < relWidth * 0.2) {
            goPrev()
          } else if (relX > relWidth * 0.8) {
            goNext()
          }
        }
      }

      dragStartRef.current = null
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [goNext, goPrev])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const CLICK_THRESHOLD = 5

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      // No interferir con el foco de inputs/textarea del formulario de rating:
      // preventDefault() en mousedown bloquea el enfoque del elemento.
      if (target.closest('textarea, input, select, button')) return
      e.preventDefault()
      pointerMovedRef.current = false
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      if (Math.abs(dx) > CLICK_THRESHOLD || Math.abs(dy) > CLICK_THRESHOLD) {
        pointerMovedRef.current = true
      }
      container.scrollLeft = dragStartRef.current.scrollLeft - dx
      container.scrollTop = dragStartRef.current.scrollTop - dy
    }

    const handleMouseUp = () => {
      dragStartRef.current = null
    }

    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (pointerMovedRef.current) return
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relWidth = rect.width

    if (relX < relWidth * 0.2) {
      goPrev()
    } else if (relX > relWidth * 0.8) {
      goNext()
    }
  }, [goPrev, goNext])

  useEffect(() => {
    if (currentPageIndex > 0 && pages[currentPageIndex - 1]) {
      const prevPage = pages[currentPageIndex - 1]
      const img = new Image()
      img.src = prevPage.url
    }
    if (currentPageIndex < pages.length - 1 && pages[currentPageIndex + 1]) {
      const nextPage = pages[currentPageIndex + 1]
      const img = new Image()
      img.src = nextPage.url
    }
  }, [currentPageIndex, pages])

  if (!Number.isFinite(workId) || workId <= 0) {
    return null
  }

  if (isLoading && pages.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#06080d]">
        <ReaderLoading label="Cargando paginas..." />
      </div>
    )
  }

  if (error && pages.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#06080d]">
        <ReaderError message={error.message} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#06080d]">
        <ReaderError message="No se encontraron paginas para esta obra." onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const showError = viewState === 'error'
  const showLoading = viewState === 'loading' || isFetching
  const showNormal = !showError && !showLoading
  const isRatingPosition = currentPageIndex === totalPages - 1

  return (
    <div className="fixed inset-0 flex flex-col bg-[#06080d] select-none">
      <ReaderHeader
        workId={workId}
        zoom={userZoom}
        onToggleMenu={() => setMenuOpen(!isMenuOpen)}
        onToggleFullscreen={toggleFullscreen}
        onZoomIn={() => adjustZoom(ZOOM_STEP)}
        onZoomOut={() => adjustZoom(-ZOOM_STEP)}
      />

      <main
        ref={containerRef}
        onClick={handleContainerClick}
        className="flex-1 w-full h-full overflow-auto scrollbar-hide relative"
      >
        {showNormal && currentPage && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={currentPageIndex === 0}
              className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-neps-card/80 border border-neps-border text-white hover:bg-neps-card hover:border-neps-primary/50 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              title="Pagina anterior"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentPageIndex >= totalPages - 1}
              className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-neps-card/80 border border-neps-border text-white hover:bg-neps-card hover:border-neps-primary/50 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              title="Pagina siguiente"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {showNormal && !isRatingPosition && !imageReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]">
            <ReaderLoading label="Cargando pagina..." />
          </div>
        )}

        {showNormal && currentPage && resolvedImageUrl && (
          <img
            src={resolvedImageUrl}
            alt={`Pagina ${currentPage?.number}`}
            className="block rounded-sm shadow-2xl ring-1 ring-white/10 select-none"
            style={{
              width: displayedWidth ? `${displayedWidth}px` : 'auto',
              height: displayedHeight ? `${displayedHeight}px` : 'auto',
              maxWidth: 'none',
              maxHeight: 'none',
              margin: 'auto',
              opacity: isTransitioning || !imageReady ? 0 : 1,
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            draggable={false}
          />
        )}

        {showNormal && isRatingPosition && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]/80 p-4">
            <div className="w-full max-w-2xl">
              <RatingForm key={workId} workId={workId} myRating={myRating} onClose={handleRatingClose} />
            </div>
          </div>
        )}

        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]/80">
            <ReaderLoading label={isFetching ? 'Cargando pagina...' : 'Cargando pagina...'} />
          </div>
        )}

        {showError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]/80">
            <ReaderError
              message={pageError ?? 'No se pudo cargar la imagen de la pagina.'}
              onRetry={handleRetry}
            />
          </div>
        )}
      </main>

      <ReaderFooter
        currentPage={currentPageIndex + 1}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        onFirst={goFirst}
        onLast={goLast}
        previousWork={previousWork}
        nextWork={nextWork}
        onPreviousWork={goPreviousWork}
        onNextWork={goNextWork}
        isLastPosition={isRatingPosition}
      />

      <ReaderMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        zoom={userZoom}
        onZoomIn={() => adjustZoom(ZOOM_STEP)}
        onZoomOut={() => adjustZoom(-ZOOM_STEP)}
      />
    </div>
  )
}
