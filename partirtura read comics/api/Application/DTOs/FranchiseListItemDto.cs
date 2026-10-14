namespace Application.DTOs;

public record FranchiseListItemDto(
    long Id,
    string Name,
    string? PublisherName,
    string? PublisherCountryName,
    long? ImageId,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    bool IsActive);
