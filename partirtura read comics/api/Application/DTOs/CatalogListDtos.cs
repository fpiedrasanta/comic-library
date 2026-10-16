using Application.Constants;

namespace Application.DTOs;

public record GetCatalogListsRequest(
    int currentPage = 1,
    int pageSize = PaginationGuard.CatalogCardDefaultPageSize,
    string? search = null,
    long? publisherId = null,
    long? franchiseId = null,
    long? seriesId = null,
    long? listTypeId = null,
    string? orderBy = null,
    string? orderDir = null);

public record CatalogListCardDto(
    long Id,
    string Name,
    long ListTypeId,
    string ListTypeName,
    string? Color,
    string? UrlCover,
    int WorkCount,
    int? ReadingProgressPercentage,
    double? AverageRating,
    int RatingCount);

public record CatalogListDetailDto(
    long Id,
    string Name,
    long ListTypeId,
    string ListTypeName,
    string? Description,
    string? Color,
    string? UrlCover,
    int WorkCount,
    int? ReadingProgressPercentage,
    long? CurrentWorkId,
    double? AverageRating,
    int RatingCount,
    IReadOnlyList<CatalogListWorkItemDto> Works);

public record CatalogListWorkItemDto(
    int Position,
    CatalogListWorkDto Work);

public record CatalogListWorkDto(
    long Id,
    string Title,
    string? Description,
    long? PublisherId,
    string? PublisherName,
    string? PublisherColor,
    long? FranchiseId,
    string? FranchiseName,
    string? FranchiseColor,
    long? SeriesId,
    string? SeriesName,
    string? SeriesColor,
    DateTime? PublicationDate,
    string? UrlCover,
    long? WorkTypeId,
    string? WorkTypeName,
    string? NumberValue,
    DateTime CreatedAt,
    int? ReadingProgressPercentage);
