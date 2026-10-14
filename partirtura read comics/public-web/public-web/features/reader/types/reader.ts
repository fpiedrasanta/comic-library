export interface ReaderPageDto {
  id: number
  number: number
  url: string
}

export interface ReaderWorkNavigation {
  id: number
  title: string
  numberValue: string | null
}

export interface MyRatingDto {
  stars: number | null
  review: string | null
  createdAt: string
  updatedAt: string | null
}

export interface ReaderWorkPagesDto {
  workId: number
  pages: ReaderPageDto[]
  previousWork: ReaderWorkNavigation | null
  nextWork: ReaderWorkNavigation | null
  currentPage: number | null
  myRating: MyRatingDto | null
}

export interface UpdateReadingProgressRequest {
  workId: number
  currentPage: number
}

export interface UpdateReadingProgressResponse {
  success: boolean
  message: string
}