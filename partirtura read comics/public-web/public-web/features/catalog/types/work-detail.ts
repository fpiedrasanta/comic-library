export interface CatalogWorkContextDto {
  id: number
  name: string
  color: string | null
  urlCover: string | null
}

export interface CatalogWorkNavigationDto {
  id: number
  title: string
  numberValue: string | null
  urlCover: string | null
}

export interface LanguageDto {
  id: number
  name: string
  code: string
}

export interface WorkTypeFilterDto {
  id: number
  name: string
}

export interface PersonByRoleDto {
  personId: number | null
  personName: string | null
  roleId: number | null
  roleName: string | null
}

export interface TagDto {
  id: number | null
  name: string | null
}

export interface CatalogWorkDetailDto {
  id: number
  publisher: CatalogWorkContextDto | null
  franchise: CatalogWorkContextDto | null
  series: CatalogWorkContextDto | null
  urlCover: string | null
  numberValue: string | null
  title: string
  description: string | null
  language: LanguageDto | null
  workType: WorkTypeFilterDto | null
  publicationDate: string | null
  previousWork: CatalogWorkNavigationDto | null
  nextWork: CatalogWorkNavigationDto | null
  personAssignments: PersonByRoleDto[]
  tags: TagDto[]
  averageRating: number | null
  ratingCount: number
  myRating: MyRatingDto | null
  myReadingProgress: MyReadingProgressDto | null
}

/** Reading states of a Work for the authenticated user. */
export type ReadingProgressStatus = 'Reading' | 'Completed'

/**
 * Reading progress of the authenticated user for a Work, from
 * `GET /api/works/{id}` (`myReadingProgress`). `null` means the user never
 * started reading the Work.
 */
export interface MyReadingProgressDto {
  currentPage: number
  totalPages: number
  percentage: number
  lastReadAt: string
  status: ReadingProgressStatus
}

export interface MyRatingDto {
  stars: number | null
  review: string | null
  createdAt: string
  updatedAt: string | null
}