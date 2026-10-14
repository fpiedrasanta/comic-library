import type { EntityOption, PublisherFilterDto, FranchiseFilterDto, SeriesFilterDto, WorkTypeFilterDto } from '../types/works'

export function publisherOption(publisher: PublisherFilterDto): EntityOption {
  return {
    id: publisher.id,
    name: publisher.name,
    color: publisher.color,
  }
}

export function franchiseOption(franchise: FranchiseFilterDto): EntityOption {
  return {
    id: franchise.id,
    name: franchise.name,
    color: franchise.color,
    ...(franchise.publisherName ? { context: `Editorial: ${franchise.publisherName}` } : {}),
    ...(franchise.publisherId ? { publisherId: franchise.publisherId } : {}),
  }
}

export function seriesOption(series: SeriesFilterDto): EntityOption {
  return {
    id: series.id,
    name: series.name,
    color: series.color,
    ...(series.franchiseName ? { context: `Franquicia: ${series.franchiseName}` } : {}),
    ...(series.publisherName ? { secondaryContext: `Editorial: ${series.publisherName}` } : {}),
    ...(series.franchiseId ? { franchiseId: series.franchiseId } : {}),
    ...(series.publisherId ? { publisherId: series.publisherId } : {}),
  }
}

export function workTypeOption(workType: WorkTypeFilterDto): EntityOption {
  return {
    id: workType.id,
    name: workType.name,
  }
}
