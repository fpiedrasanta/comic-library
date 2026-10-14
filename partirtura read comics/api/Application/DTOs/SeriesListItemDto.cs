namespace Application.DTOs;

public record SeriesListItemDto(
    long Id,
    string Name,
    string? FranchiseName,
    string? PublisherName,
    string? PublisherCountryName,
    long? ImageId,
    string? UrlImage,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    bool IsActive,
    DateTime CreatedAt);
