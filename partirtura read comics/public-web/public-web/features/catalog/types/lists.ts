/**
 * The two US-0027 listings, as delivered by `GET /api/catalog/lists`
 * and `GET /api/catalog/lists/{id}`.
 *
 * Only official, active lists are returned, and no administrative data
 * travels with them: no `isActive`, `ownerType`, `visibility` or
 * `createdAt`.
 *
 * US-0036 added the personal lists of the user to the same endpoint, so the
 * list type is optional: a personal list has no type of list.
 */

export interface CatalogListCardDto {
  id: number
  name: string
  /** Null for a personal list, which has no type of list. */
  listTypeId: number | null
  /** Null for a personal list, which has no type of list. */
  listTypeName: string | null
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
  /**
   * Reading progress of the authenticated user for this work, or `null` when the
   * user never opened it. Only the stored percentage travels: the reader keeps its
   * own position, so there is no current page or total here.
   */
  readingProgressPercentage: number | null
}

export interface CatalogListWorkItemDto {
  position: number
  work: CatalogListWorkDto
}

export interface CatalogListDetailDto {
  id: number
  name: string
  /** Null for a personal list, which has no type of list. */
  listTypeId: number | null
  /** Null for a personal list, which has no type of list. */
  listTypeName: string | null
  description: string | null
  color: string | null
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
  /**
   * The work the authenticated user should resume from when continuing this
   * list. `null` for an empty list or when the API cannot resolve a current
   * work (the fallback is computed server-side and is never persisted without
   * the user navigating). Resolved by `GET /api/catalog/lists/{id}`.
   */
  currentWorkId: number | null
  /** Ordered by `WorkListItem.Position`, as defined by the list. */
  works: CatalogListWorkItemDto[]
}

/**
 * One of the personal lists of the authenticated user, with the membership of
 * the work the selector is showing. Delivered by `GET /api/users/me/lists`.
 */
export interface PersonalListMembershipDto {
  id: number
  name: string
  description: string | null
  color: string | null
  urlCover: string | null
  workCount: number
  /** Whether the work of the query belongs to this list. */
  containsWork: boolean
}

/** Summary of a personal list, as the administration operations return it. */
export interface PersonalListSummaryDto {
  id: number
  name: string
  description: string | null
  color: string | null
  urlCover: string | null
  workCount: number
  createdAt: string
}
