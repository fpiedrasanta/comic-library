import { useState } from 'react'
import type { WorkCatalogItemDto } from '../types/works'
import { PersonalListsModal } from './personal-lists-modal'

const BUTTON_CLASS =
  'p-1 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neps-primary'
const IN_LIST_BUTTON_CLASS = 'bg-neps-primary/15 border-neps-primary/50 text-neps-primary'
const NOT_IN_LIST_BUTTON_CLASS =
  'bg-neps-input border-neps-border text-neps-muted hover:border-neps-primary/50 hover:text-neps-primary'

interface PersonalListButtonProps {
  work: WorkCatalogItemDto
}

/**
 * The button that opens the personal lists of a work.
 *
 * Blue when the work belongs to at least one personal list and gray when it
 * does not. It never belongs to a single list: a work can be in several of
 * them at the same time.
 */
export function PersonalListButton({ work }: PersonalListButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isInPersonalList = work.isInPersonalList
  const label = `Administrar las listas de ${work.title}`

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label}
        title={label}
        className={`${BUTTON_CLASS} ${
          isInPersonalList ? IN_LIST_BUTTON_CLASS : NOT_IN_LIST_BUTTON_CLASS
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2-2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </button>

      {isOpen && <PersonalListsModal work={work} open onOpenChange={setIsOpen} />}
    </>
  )
}
