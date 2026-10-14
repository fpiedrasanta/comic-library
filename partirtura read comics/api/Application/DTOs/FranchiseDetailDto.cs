namespace Application.DTOs;

public record FranchiseDetailDto(
    long Id,
    string Name,
    string? Description,
    long PublisherId,
    string? PublisherName,
    string? PublisherCountryName,
    long? ImageId,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    bool IsActive);
