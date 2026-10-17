/**
 * Shape of `GET /api/reading/lists/{listId}/work/{workId}`, delivered by
 * `ListReaderContextDto` (see api/ Application/DTOs/ListReaderContextDto.cs).
 * Mirrors the backend records exactly; the frontend never invents fields.
 */

/**
 * The user's *work* rating as carried by the reader context.
 * Mirrors the backend `ReaderMyRatingDto(stars, review)`: it only ships a
 * score and an optional review, with no timestamps.
 */
export interface ListReaderMyRatingDto {
  stars: number | null
  review: string | null
}

/**
 * The user's *list* rating, mirroring the backend `ReaderListRatingDto(
 * workListId, stars, review, createdAt, updatedAt)`.
 */
export interface ListReaderListRatingDto {
  workListId: number
  stars: number | null
  review: string | null
  createdAt: string
  updatedAt: string | null
}

export interface ListReaderListDto {
  id: number
  name: string
  listTypeId: number
  listTypeName: string
  description: string | null
  color: string | null
  urlCover: string | null
  workCount: number
  /** Percentage of works completed by the authenticated user. `null` when no progress. */
  readingProgressPercentage: number | null
  /** Work the user resumes from. `null` for an empty list. */
  currentWorkId: number | null
  /** List average rating, `null` when `ratingCount` is 0. */
  averageRating: number | null
  ratingCount: number
  /** The user's rating for the list, or `null`. */
  myRating: ListReaderListRatingDto | null
}

export interface ListReaderListWorkDto {
  id: number
  title: string
  description: string | null
  urlCover: string | null
  /** Percentage of this work the user has completed, or `null` when never opened. */
  readingProgressPercentage: number | null
}

export interface ListReaderListItemDto {
  position: number
  work: ListReaderListWorkDto
  /** Last page the user read of this work (1-based), or `null`. */
  currentPage: number | null
  /** The user's rating for this work, or `null`. */
  myRating: ListReaderMyRatingDto | null
}

export interface ListReaderPageDto {
  id: number
  number: number
  url: string
}

export interface ListReaderContextDto {
  /** The list being read. */
  list: ListReaderListDto
  /** All works of the list, ordered by `WorkListItem.Position`. */
  works: ListReaderListItemDto[]
  /** Identifier of the work being read. */
  workId: number
  /** Pages of the work being read. */
  pages: ListReaderPageDto[]
  /** Current page of the work being read (1-based), or `null`. */
  currentPage: number | null
  /** The user's rating for the work being read, or `null`. */
  myRating: ListReaderMyRatingDto | null
}

/** Request body for `PUT /api/reading/lists/{listId}/current-work`. */
export interface SetListCurrentWorkRequest {
  workId: number
}
