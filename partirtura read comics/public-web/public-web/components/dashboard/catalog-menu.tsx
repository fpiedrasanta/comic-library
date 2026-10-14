import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export interface NavMenuItem {
  label: string
  /** Absent while the section has no page yet; the item renders disabled. */
  to?: string
}

export interface NavMenuGroup {
  /** A horizontal rule between groups. */
  divider?: boolean
  items: NavMenuItem[]
}

/**
 * Shared contents of the catalog menu, used by the desktop dropdown and by the
 * mobile menu so both offer exactly the same sections.
 *
 * Favoritos and Mis listas have no route yet, so they are listed as disabled:
 * the menu shows what is coming without offering a navigation that would land on
 * an empty screen.
 */
export const CATALOG_MENU_GROUPS: NavMenuGroup[] = [
  {
    items: [
      { label: 'Explorar catálogo', to: '/catalog' },
      { label: 'Editoriales', to: '/publishers' },
      { label: 'Franquicias', to: '/franchises' },
      { label: 'Series', to: '/series' },
      { label: 'Listas', to: '/lists' },
    ],
  },
  {
    divider: true,
    items: [
      { label: 'Mi colección', to: '/my-collection' },
      { label: 'Favoritos' },
      { label: 'Mis listas' },
    ],
  },
]

/** True when the path belongs to the catalog, listing or collection pages. */
export function isCatalogPath(pathname: string): boolean {
  return ['/catalog', '/publishers', '/franchises', '/series', '/lists', '/my-collection'].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

const ITEM_CLASS = 'block w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors'
const ENABLED_ITEM_CLASS = 'text-slate-200 hover:text-white hover:bg-neps-card'
const DISABLED_ITEM_CLASS = 'text-neps-muted/50 cursor-not-allowed'

function MenuItems({ groups, onNavigate }: { groups: NavMenuGroup[]; onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <>
      {groups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.divider && <div className="my-1.5 border-t border-neps-border" />}
          {group.items.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                className={`${ITEM_CLASS} ${ENABLED_ITEM_CLASS} ${
                  isCatalogPath(pathname) && item.to === pathname ? 'text-neps-primary' : ''
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                aria-disabled
                title="Próximamente"
                className={`${ITEM_CLASS} ${DISABLED_ITEM_CLASS}`}
              >
                {item.label}
              </span>
            ),
          )}
        </div>
      ))}
    </>
  )
}

/**
 * The catalog dropdown of the desktop header. Closes on outside click, on
 * Escape and after navigating, so it never stays open over the page.
 */
export function CatalogMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const active = isCatalogPath(pathname)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
          active
            ? 'bg-neps-card text-neps-primary border border-neps-primary/30'
            : 'text-neps-muted hover:text-white hover:bg-neps-card'
        }`}
      >
        Catálogo
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-neps-bg border border-neps-border rounded-xl p-1.5 shadow-2xl z-50">
          <MenuItems groups={CATALOG_MENU_GROUPS} onNavigate={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}

/** The same menu behind a hamburger, for widths where the desktop nav is hidden. */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Menú de navegación"
        className="p-2 text-neps-muted hover:text-white rounded-lg hover:bg-neps-card transition-colors"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full bg-neps-bg border-b border-neps-border p-3 shadow-2xl z-50 space-y-1">
          <Link
            to="/index"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:text-white hover:bg-neps-card ${
              pathname === '/index' ? 'text-neps-primary' : 'text-slate-200'
            }`}
          >
            Inicio
          </Link>
          <span className="block px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neps-muted/60">
            Catálogo
          </span>
          <MenuItems groups={CATALOG_MENU_GROUPS} onNavigate={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}
