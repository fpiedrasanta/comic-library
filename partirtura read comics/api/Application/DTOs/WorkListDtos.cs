using Domain.Enums;

namespace Application.DTOs;

public record WorkListListItemDto(
    long Id,
    string Name,
    DateTime CreatedAt,
    string? Type,
    long? CoverId,
    string? UrlCover,
    bool IsActive);

public record WorkListDetailDto(
    long Id,
    string Name,
    string? Description,
    long? CoverId,
    string? UrlCover,
    string? Color,
    long? ListTypeId,
    string? ListTypeName,
    Visibility Visibility,
    Domain.Enums.OwnerType OwnerType,
    long? OwnerUserId,
    bool IsActive,
    DateTime CreatedAt,
    IReadOnlyList<WorkListWorkItemDto> Works);

public record WorkListWorkItemDto(
    long WorkId,
    int Position,
    WorkListWorkDto Work);

public record WorkListWorkDto(
    long Id,
    string Title,
    string? NumberValue,
    long? SeriesId,
    string? SeriesName,
    long? FranchiseId,
    string? FranchiseName,
    long? PublisherId,
    string? PublisherName,
    long? CoverId,
    string? UrlCover,
    bool IsActive);

public record CreateWorkListRequest(
    string Name,
    string? Description,
    byte[]? CoverData,
    string? CoverFileName,
    string? Color,
    long ListTypeId,
    Visibility Visibility,
    IReadOnlyList<WorkListWorkItemRequest> Works);

public record UpdateWorkListRequest(
    string Name,
    string? Description,
    byte[]? CoverData,
    string? CoverFileName,
    long? CoverImageId,
    string? Color,
    long ListTypeId,
    Visibility Visibility,
    IReadOnlyList<WorkListWorkItemRequest> Works);

public record WorkListWorkItemRequest(
    long WorkId,
    int Position);
