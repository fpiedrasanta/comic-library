using Domain.Enums;

namespace Application.DTOs;

public record WorkListItemDto(
    long Id,
    string Title,
    string? Description,
    long? LanguageId,
    string? LanguageName,
    long? CoverId,
    string? UrlCover,
    bool IsActive,
    DateTime? PublicationDate,
    DateTime CreatedAt,
    ContentStatus ContentStatus,
    string? ContentError,
    string WorkType,
    long? SeriesId,
    string? SeriesName,
    long? FranchiseId,
    string? FranchiseName,
    long? PublisherId,
    string? PublisherName,
    string? NumberValue,
    string? PreviousNumberValue,
    string? NextNumberValue,
    bool IARequest,
    IAProcessingStatus? IAStatus,
    DateTimeOffset? IARequestedAt,
    TimeSpan? Since);
