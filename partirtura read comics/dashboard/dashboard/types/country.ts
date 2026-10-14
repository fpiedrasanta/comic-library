export interface Country {
  id: number
  code: string
  name: string
  isActive: boolean
}

export interface CountryListResponse {
  currentPage: number
  hasNextPage: boolean
  hasPriorPage: boolean
  totalPages: number
  pageSize: number
  nextPage: number | null
  priorPage: number | null
  totalCount: number
  items: Country[]
}

export interface CreateCountryResponse {
  id: number
}
