namespace Application.DTOs;

public record GetCatalogWorksRequest(
    int currentPage = 1,
    int pageSize = 12,
    string? search = null,
    long? publisherId = null,
    long? franchiseId = null,
    long? seriesId = null,
    long? workTypeId = null,
    string? orderBy = null,
    string? orderDir = null);

public record WorkCatalogNodeDto(
    long Id,
    string Name,
    string? Color);

public record WorkCatalogItemDto(
    long Id,
    long? WorkTypeId,
    string? WorkTypeName,
    string Title,
    string? Description,
    string? NumberValue,
    DateTime? PublicationDate,
    DateTime CreatedAt,
    long? CoverId,
    string? UrlCover,
    WorkCatalogNodeDto? Series,
    WorkCatalogNodeDto? Franchise,
    WorkCatalogNodeDto? Publisher,
    ReaderMyProgressDto? MyReadingProgress,
    double? AverageRating);

public record CatalogWorkContextDto(
    long Id,
    string Name,
    string? Color,
    string? UrlCover);

public record CatalogWorkNavigationDto(
    long Id,
    string Title,
    string? NumberValue,
    string? UrlCover);

public record CatalogWorkDetailDto(
    long Id,
    CatalogWorkContextDto? Publisher,
    CatalogWorkContextDto? Franchise,
    CatalogWorkContextDto? Series,
    string? UrlCover,
    string? NumberValue,
    string Title,
    string? Description,
    LanguageDto? Language,
    WorkTypeFilterDto? WorkType,
    DateTime? PublicationDate,
    CatalogWorkNavigationDto? PreviousWork,
    CatalogWorkNavigationDto? NextWork,
    IReadOnlyList<PersonByRoleDto> PersonAssignments,
    IReadOnlyList<TagDto> Tags,
    double AverageRating,
    int RatingCount,
    ReaderMyProgressDto? MyReadingProgress);
