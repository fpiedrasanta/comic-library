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
