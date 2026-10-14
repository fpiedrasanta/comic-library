import type { ListResponse } from '@/types/api'

/**
 * A parent referenced by a card, with just what a pill needs: the entity to
 * name it, the identity to color it and the detail page to open.
 */
export interface CatalogCardPill {
  level: 'publisher' | 'franchise'
  id: number
  name: string
  /** Null when the entity has no stored color. */
  color: string | null
  to: string
}

export interface CatalogPublisherCardDto {
  id: number
  name: string
  color: string | null
  urlImage: string | null
}

export interface CatalogFranchiseCardDto {
  id: number
  name: string
  color: string | null
  urlImage: string | null
  /** Always present: the publisher is a required foreign key. */
  publisher: CatalogCardNodeDto
}

export interface CatalogSeriesCardDto {
  id: number
  name: string
  color: string | null
  urlImage: string | null
  franchise: CatalogCardNodeDto
  publisher: CatalogCardNodeDto
}

export interface CatalogCardNodeDto {
  id: number
  name: string
  color: string | null
}

export type CatalogCardListResponse<T> = ListResponse<T>

/** The three listings of US-0026, as one configurable concept. */
export type CatalogEntityKind = 'publisher' | 'franchise' | 'series'

/**
 * The card shape the shared listing renders, identical for the three
 * listings. Publisher, Franchise and Series differ only in which pills they
 * carry, so the difference is data and never layout.
 */
export interface CatalogEntityCard {
  id: number
  name: string
  color: string | null
  urlImage: string | null
  /** Ordered outermost first: editorial, then franchise. Empty for publishers. */
  pills: CatalogCardPill[]
  /** The detail page the card itself opens. */
  to: string
}
