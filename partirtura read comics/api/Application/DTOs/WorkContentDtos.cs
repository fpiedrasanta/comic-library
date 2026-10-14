namespace Application.DTOs;

public record ReaderWorkPagesDto(
    long WorkId,
    ReaderWorkNavigationDto? PreviousWork,
    ReaderWorkNavigationDto? NextWork,
    IReadOnlyList<ReaderPageDto> Pages,
    int? CurrentPage,
    ReaderMyRatingDto? MyRating);

public record ReaderMyRatingDto(
    int Stars,
    string? Review);

public record ReaderMyProgressDto(
    int CurrentPage,
    int TotalPages,
    int Percentage,
    DateTimeOffset? LastReadAt,
    string Status);

public record GetReadingHistoryRequest(
    int currentPage = 1,
    int pageSize = 12,
    string? state = null);

public record ReaderWorkNavigationDto(long Id, string Title, string? NumberValue);

public record ReaderPageDto(long Id, int Number, string Url);

public record WorkImageItemDto(
    long Id,
    string Url);

public record WorkImagesResponse(
    IReadOnlyList<WorkImageItemDto> Images);

public record SetCoverRequest(
    long ImageId);

public record AnalyzeComicRequest(
    IReadOnlyList<long> ImageIds);

public record ComicAnalysisResult(
    string? Title,
    string? Publisher,
    string? Number,
    string? Description,
    string? Summary,
    string? PublicationDate,
    IReadOnlyList<string> Writers,
    IReadOnlyList<string> Artists,
    IReadOnlyList<string> Inkers,
    IReadOnlyList<string> Tags,
    IReadOnlyList<string> Characters);

public record UpdateReadingProgressRequest(
    long WorkId,
    int CurrentPage);