namespace Application.DTOs;

public record AdminPublisherDetailDto(
    long Id,
    string Name,
    string? Description,
    string? Website,
    long CountryId,
    string CountryName,
    int? FoundedYear,
    string? History,
    bool IsAlive,
    long? ImageId,
    string? UrlImage,
    string? Color,
    bool IsFeatured,
    bool IsActive,
    DateTime CreatedAt);
