namespace Application.DTOs;

public record SeriesDetailDto(
    long Id,
    string Name,
    string? Description,
    long FranchiseId,
    string? FranchiseName,
    long? FranchiseImageId,
    string? FranchiseUrlImage,
    string? FranchiseColor,
    bool FranchiseIsFeatured,
    bool FranchiseIsOngoing,
    bool FranchiseIsActive,
    long? PublisherId,
    string? PublisherName,
    string? PublisherCountryName,
    long? ImageId,
    string? UrlImage,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    bool IsActive);
