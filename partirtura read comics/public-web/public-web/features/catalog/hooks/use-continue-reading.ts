import { useReadingHistory } from './use-reading-history'

/**
 * Works the Continue reading section asks for.
 * A multiple of three, the column count of the section grid, so rows fill evenly.
 */
const CONTINUE_READING_PAGE_SIZE = 12

/**
 * Works the user is currently reading, for the Continue reading section.
 * Reading history, capped to the section size and ordered by last activity.
 */
export function useContinueReading() {
  return useReadingHistory('reading', CONTINUE_READING_PAGE_SIZE)
}
