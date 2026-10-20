/**
 * Cache namespaces of the listings that expose works.
 *
 * The favorites listing has its own namespace: it is the catalog with the
 * `isFavorite` criterion, so it holds a different set of works and has to be
 * told apart from the rest when the cached state of a work changes.
 */
export const WORKS_LISTING_KEY = 'works'
export const FAVORITES_LISTING_KEY = 'favorites'
export const READING_HISTORY_KEY = 'reading-history'
export const RECOMMENDED_WORKS_KEY = 'recommended-works'

/** The lists of the catalog, of the system and the personal ones. */
export const CATALOG_LISTS_KEY = 'catalog-lists'

/** The personal lists of the user, with the membership of a work. */
export const PERSONAL_LISTS_KEY = 'personal-lists'

/** The detail of a list, of the system or of a personal one. */
export const LIST_DETAIL_KEY = 'catalog-list-detail'

/**
 * Listings that show the favorite state of every work they return, except the
 * favorites listing: there a work that stops being a favorite leaves the
 * results instead of only changing its state.
 */
export const WORK_STATE_LISTING_KEYS = [
  WORKS_LISTING_KEY,
  READING_HISTORY_KEY,
  RECOMMENDED_WORKS_KEY,
] as const
