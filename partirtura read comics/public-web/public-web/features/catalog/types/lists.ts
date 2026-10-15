/**
 * The two US-0027 listings, as delivered by `GET /api/catalog/lists`
 * and `GET /api/catalog/lists/{id}`.
 *
 * Only official, active lists are returned, and no administrative data
 * travels with them: no `isActive`, `ownerType`, `visibility` or
 * `createdAt`.
 */

export interface CatalogListCardDto {
  id: number
  name: string
  listTypeId: number
  listTypeName: string
  /** Null when the list has no color. */
  color: string | null
  /** Null when the list has no cover image. */
  urlCover: string | null
  workCount: number
  /**
   * Percentage of the works of the list the authenticated user has completed.
   * `0` for an empty list and `null` when the user has no progress on any of its
   * works, so the two cases must be told apart and never turned into a value.
   */
  readingProgressPercentage: number | null
  /** List average rating, `null` when `ratingCount` is 0. */
  averageRating: number | null
  ratingCount: number
}

/**
 * A work inside a list, with everything the existing WorkCard needs to
 * render: the number within its series and the upload date included.
 */
export interface CatalogListWorkDto {
  id: number
  title: string
  description: string | null
  publisherId: number | null
  publisherName: string | null
  publisherColor: string | null
  franchiseId: number | null
  franchiseName: string | null
  franchiseColor: string | null
  seriesId: number | null
  seriesName: string | null
  seriesColor: string | null
  publicationDate: string | null
  urlCover: string | null
  workTypeId: number | null
  workTypeName: string | null
  /** The work's number within its series, when it has one. */
  numberValue: string | null
  /** When the work was uploaded. */
  createdAt: string
}

export interface CatalogListWorkItemDto {
  position: number
  work: CatalogListWorkDto
}

export interface CatalogListDetailDto {
  id: number
  name: string
  listTypeId: number
  listTypeName: string
  description: string | null
  color: string | null
  urlCover: string | null
  workCount: number
  /** Ordered by `WorkListItem.Position`, as defined by the list. */
  works: CatalogListWorkItemDto[]
}
