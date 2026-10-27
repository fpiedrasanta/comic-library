import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReaderStore } from '../stores/reader-store'
import { useProtectedImage } from '@/hooks/use-protected-image'
import { ReaderHeader } from './reader-header'
import { ReaderFooter } from './reader-footer'
import { ReaderMenu } from './reader-menu'
import { ReaderLoading, ReaderError } from './reader-states'
import { RatingForm } from './rating-form'
import { ListRatingForm } from './list-rating-form'
import { getListReaderContext } from '../api/reader-repository'
import { useSetListCurrentWork } from '../hooks/use-list-reader-context'
import { useUpdateReadingProgress } from '../hooks/use-reading-progress'
import { useNormalizeCurrentPage } from '../hooks/use-normalize-current-page'
import type { ListReaderContextDto } from '../types/list-reader-context'
import type { MyRatingDto } from '@/features/catalog/api/ratings-repository'

interface ListReaderProps {
  listId: number
  workId: number
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

export function ListReader({ listId, workId }: ListReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [viewState, setViewState] = useState<'normal' | 'loading' | 'error'>('normal')
  const [pageError, setPageError] = useState<string | null>(null)
  const [userZoom, setUserZoom] = useState(1)
  const [displayDimensions, setDisplayDimensions] = useState<{ width: number; height: number } | null>(null)
  const [imageReady, setImageReady] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null)
  const pointerMovedRef = useRef(false)

  const navigate = useNavigate()
  const [ctx, setCtx] = useState<ListReaderContextDto | null>(null)

  const setCurrentWorkHook = useSetListCurrentWork(listId)
  const mutateProgressHook = useUpdateReadingProgress(workId)
  const normalizeCurrentPageHook = useNormalizeCurrentPage()

  const setCurrentWorkRef = useRef(setCurrentWorkHook)
  const persistCurrentPageRef = useRef((index: number) => mutateProgressHook.mutate(index + 1))
  const normalizeCurrentPageRef = useRef(normalizeCurrentPageHook)

  setCurrentWorkRef.current = setCurrentWorkHook
  persistCurrentPageRef.current = (index: number) => mutateProgressHook.mutate(index + 1)
  normalizeCurrentPageRef.current = normalizeCurrentPageHook

  const isMenuOpen = useReaderStore((s) => s.isMenuOpen)
  const setMenuOpen = useReaderStore((s) => s.setMenuOpen)

  const navigateToWork = useCallback(
    async (targetWorkId: number) => {
      await setCurrentWorkRef.current.mutateAsync(targetWorkId)
      navigate(`/lists/${listId}/work/${targetWorkId}`)
    },
    [navigate, listId]
  )

  const displayedWidth = displayDimensions?.width ?? 0
  const displayedHeight = displayDimensions?.height ?? 0

  // Resetear estado de UI cuando cambia de Work
  useEffect(() => {
    setCurrentPageIndex(0)
    setDisplayDimensions(null)
    setImageReady(false)
    setIsTransitioning(false)
    setViewState('normal')
    setPageError(null)
  }, [workId])

  const pages = ctx?.pages ?? []
  const currentPage = currentPageIndex < pages.length ? pages[currentPageIndex] : null
  const currentPageUrl = currentPage?.url ?? null
  const resolvedImageUrl = useProtectedImage(currentPageUrl)
  const myRating = ctx?.myRating ?? null
  const resolvedRating: MyRatingDto | null = myRating
    ? { stars: myRating.stars, review: myRating.review, createdAt: '', updatedAt: null }
    : null

  /** Works of the list ordered by position (already ordered by the backend). */
  const works = ctx?.works ?? []
  const currentWorkIndex = works.findIndex((w) => w.work.id === workId)
  const prevWorkItem = currentWorkIndex > 0 ? works[currentWorkIndex - 1] : null
  const nextWorkItem = currentWorkIndex >= 0 && currentWorkIndex < works.length - 1 ? works[currentWorkIndex + 1] : null
  /** True when the current work is the last one of the list (by position). */
  const isLastWork = currentWorkIndex >= 0 && currentWorkIndex === works.length - 1
  /** Total pages: content pages + work rating (+ list rating only for the last work). */
  const totalPages = isLastWork ? pages.length + 2 : pages.length + 1
  /** Posición del formulario de valoración del work (siempre después del contenido). */
  const isWorkRatingPosition = currentPageIndex === pages.length
  /** Posición del formulario de valoración de la lista (solo último work, después del work rating). */
  const isListRatingPosition = isLastWork && currentPageIndex === pages.length + 1
  const isAnyRatingPosition = isWorkRatingPosition || isListRatingPosition

  const previousWork = prevWorkItem
    ? { id: prevWorkItem.work.id, title: prevWorkItem.work.title, numberValue: null }
    : null
  const nextWork = nextWorkItem
    ? { id: nextWorkItem.work.id, title: nextWorkItem.work.title, numberValue: null }
    : null

  // Consulta directa al backend y persiste solo si hay diferencia real.
  // Reglas del usuario:
  //  - currentPage === null => pagina 1 y PUT /works/{workId}/progress
  //  - currentPage != null   => mostrarla, no persistir nada
  //  - workId URL != currentWorkId backend => PUT /reading/lists/{listId}/current-work
  //  - workId URL == currentWorkId backend => no hacer nada
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const data = await getListReaderContext(listId, workId)
      if (cancelled) return
      setCtx(data)

      const backendPage = data.currentPage ?? null
      const backendCurrentWork = data.list.currentWorkId ?? null
      const works = data.works ?? []
      const currentWorkIndex = works.findIndex((w) => w.work.id === workId)
      const isLastWork = currentWorkIndex >= 0 && currentWorkIndex === works.length - 1
      const totalPages = isLastWork ? data.pages.length + 2 : data.pages.length + 1

      // currentPage null => pagina 1, persistir al backend
      if (backendPage === null) {
        setCurrentPageIndex(0)
        persistCurrentPageRef.current(0)
      } else {
        setCurrentPageIndex(normalizeCurrentPageRef.current(backendPage, totalPages))
      }

      // workId de la url distinto al currentWorkId del backend => persistir work actual
      if (workId !== backendCurrentWork) {
        void setCurrentWorkRef.current.mutateAsync(workId)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [listId, workId])

  const navigateTo = useCallback((index: number) => {
    if (index < 0 || index >= totalPages) return
    if (index === currentPageIndex) return

    setViewState('normal')
    setPageError(null)
    setCurrentPageIndex(index)
    setDisplayDimensions(null)
    setImageReady(false)
    setIsTransitioning(true)
    persistCurrentPageRef.current(index)

    if (containerRef.current) {
      containerRef.current.scrollLeft = 0
      containerRef.current.scrollTop = 0
    }
  }, [currentPageIndex, totalPages])

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

  const scrollBy = useCallback((dx: number, dy: number) => {
    const container = containerRef.current
    if (!container) return
    container.scrollBy({ top: dy, left: dx, behavior: 'smooth' })
  }, [])

  const handleRatingClose = useCallback(() => {
    navigate(`/lists/${listId}`)
  }, [listId, navigate])

  // Navegación entre Works: persiste el Work actual y navega al vecino.
  const goPreviousWork = useCallback(() => {
    if (!previousWork) return
    void navigateToWork(previousWork.id)
  }, [previousWork, navigateToWork])

  const goNextWork = useCallback(() => {
    if (!nextWork) return
    void navigateToWork(nextWork.id)
  }, [nextWork, navigateToWork])

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

  if (!Number.isFinite(workId) || workId <= 0) {
    return null
  }

  if (!ctx && pages.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#06080d]">
        <ReaderLoading label="Cargando paginas..." />
      </div>
    )
  }

  if (ctx && pages.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#06080d]">
        <ReaderError message="No se encontraron paginas para esta obra." onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const showError = viewState === 'error'
  const showLoading = viewState === 'loading'
  const showNormal = !showError && !showLoading

  return (
    <div className="fixed inset-0 flex flex-col bg-[#06080d] select-none">
      <ReaderHeader
        workId={workId}
        zoom={userZoom}
        onToggleMenu={() => setMenuOpen(!isMenuOpen)}
        onToggleFullscreen={toggleFullscreen}
        onZoomIn={() => adjustZoom(ZOOM_STEP)}
        onZoomOut={() => adjustZoom(-ZOOM_STEP)}
        returnPath={`/lists/${listId}`}
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

        {showNormal && !isAnyRatingPosition && !imageReady && (
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

        {showNormal && isAnyRatingPosition && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]/80 p-4">
            <div className="w-full max-w-2xl">
              {isListRatingPosition && ctx ? (
                <>
                  <div className="mb-2 flex items-center justify-center gap-1 text-xs text-brand-400 uppercase font-bold tracking-wider">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4" />
                    </svg>
                    Valorando lista
                  </div>
                  <ListRatingForm
                    key="list-rating"
                    listId={listId}
                    existingRating={ctx.list.myRating}
                    onSaved={(savedRating) => {
                      setCtx((prev) =>
                        prev ? { ...prev, list: { ...prev.list, myRating: savedRating } } : null
                      )
                    }}
                    variant="list"
                  />
                </>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-center gap-1 text-xs text-neps-primary uppercase font-bold tracking-wider">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4" />
                    </svg>
                    Valorando obra
                  </div>
                  <RatingForm
                    key="work-rating"
                    workId={workId}
                    myRating={resolvedRating}
                    onClose={handleRatingClose}
                    onSaved={(savedRating) => {
                      setCtx((prev) =>
                        prev ? { ...prev, myRating: savedRating } : null
                      )
                      if (isWorkRatingPosition && isLastWork) {
                        navigateTo(pages.length + 1)
                      }
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {showLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#06080d]/80">
            <ReaderLoading label="Cargando pagina..." />
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
        isLastPosition={isAnyRatingPosition}
      />

      <ReaderMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        zoom={userZoom}
        onZoomIn={() => adjustZoom(ZOOM_STEP)}
        onZoomOut={() => adjustZoom(-ZOOM_STEP)}
        listContext={
          ctx
            ? {
                listId,
                workId,
                works,
                onSelectWork: navigateToWork,
              }
            : undefined
        }
      />
    </div>
  )
}
