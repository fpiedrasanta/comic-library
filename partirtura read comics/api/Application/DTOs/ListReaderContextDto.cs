namespace Application.DTOs;

public record ReaderListRatingDto(long? WorkListId, int Stars, string? Review, DateTime CreatedAt, DateTime? UpdatedAt);

public record ReaderListCatalogDto(
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
    ReaderListRatingDto? MyRating);

public record ReaderListWorkDto(
    long Id,
    string Title,
    string? Description,
    string? UrlCover,
    int? ReadingProgressPercentage);

public record ReaderListWorkItemDto(
    int Position,
    ReaderListWorkDto Work,
    int? CurrentPage,
    ReaderMyRatingDto? MyRating);

public record ListReaderContextDto(
    ReaderListCatalogDto List,
    IReadOnlyList<ReaderListWorkItemDto> Works,
    long WorkId,
    IReadOnlyList<ReaderPageDto> Pages,
    int? CurrentPage,
    ReaderMyRatingDto? MyRating);
