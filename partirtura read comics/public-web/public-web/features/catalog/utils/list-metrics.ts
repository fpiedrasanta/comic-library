/** Rating range the star scale can represent. */
const MIN_RATING = 1
const MAX_RATING = 5

/**
 * A list rating is only shown when the average is inside the valid star range.
 * A `0` average (every vote zero stars) or a missing one says nothing useful to
 * show, so the rating block stays hidden instead of inventing a score.
 */
export function hasVisibleRating(averageRating: number | null): averageRating is number {
  return averageRating !== null && averageRating >= MIN_RATING && averageRating <= MAX_RATING
}

/**
 * Reading progress is only shown when the API returns it. `null` means the user
 * has no progress recorded at all, which is not the same as `0`, so the two
 * cases must never be collapsed into one. Identical semantics to `WorkCard`,
 * where a null `MyReadingProgress` renders nothing and a persisted percentage
 * (including `0` when status is `Reading`) is always surfaced.
 */
export function hasVisibleProgress(percentage: number | null): percentage is number {
  return percentage !== null
}
