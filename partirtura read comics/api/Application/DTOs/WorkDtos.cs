using Domain.Enums;

namespace Application.DTOs;

public record CreateWorkRequest(
    long WorkTypeId,
    string Title,
    string? Description,
    long LanguageId,
    DateTime PublicationDate,
    long? CoverImageId,
    long? SeriesId,
    long? FranchiseId,
    long? PublisherId,
    string? NumberValue,
    long? PreviousNumberId,
    long? NextNumberId,
    IReadOnlyList<PersonByRoleRequest> PersonByRoles,
    IReadOnlyList<TagRequest> Tags,
    byte[]? CoverData,
    string? CoverFileName);

public record CreateWorkWithContentRequest(
    long? WorkTypeId,
    string Title,
    long? LanguageId = null,
    DateTime? PublicationDate = null,
    long? CoverImageId = null,
    long? SeriesId = null,
    long? FranchiseId = null,
    long? PublisherId = null,
    string? NumberValue = null,
    long? PreviousNumberId = null,
    long? NextNumberId = null,
    IReadOnlyList<PersonByRoleRequest>? PersonByRoles = null,
    IReadOnlyList<TagRequest>? Tags = null,
    byte[]? CoverData = null,
    string? CoverFileName = null,
    byte[]? ContentFileData = null,
    string? ContentFileName = null);

public record UpdateWorkRequest(
    long WorkTypeId,
    string Title,
    string? Description,
    long LanguageId,
    DateTime PublicationDate,
    long? CoverImageId,
    long? SeriesId,
    long? FranchiseId,
    long? PublisherId,
    string? NumberValue,
    long? PreviousNumberId,
    long? NextNumberId,
    IReadOnlyList<PersonByRoleRequest> PersonByRoles,
    IReadOnlyList<TagRequest> Tags,
    byte[]? CoverData,
    string? CoverFileName);

public record WorkDetailDto(
    long Id,
    long WorkTypeId,
    string WorkTypeName,
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
    long? SeriesId,
    string? SeriesName,
    long? FranchiseId,
    string? FranchiseName,
    long? PublisherId,
    string? PublisherName,
    string? PublisherCountryName,
    string? NumberValue,
    NumberReferenceDto? PreviousNumber,
    NumberReferenceDto? NextNumber,
    long? FileId,
    long PageCount,
    IReadOnlyList<PersonByRoleDto>? PersonByRoles,
    IReadOnlyList<TagDto>? Tags,
    IAProcessingStatus? IAStatus,
    ComicAnalysisResult? IAResult,
    DateTimeOffset? IARequestedAt);

public record NumberReferenceDto(
    long? Id,
    string? NumberValue,
    string? Title);

public record PersonByRoleDto(
    long? PersonId,
    string? PersonName,
    long? RoleId,
    string? RoleName);

public record TagDto(
    long? Id,
    string? Name);

public record PersonByRoleRequest(
    long PersonId,
    long RoleId);

public record TagRequest(
    long Id,
    string Name);