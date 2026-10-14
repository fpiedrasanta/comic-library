namespace Application.DTOs;

public record PublisherDto(
    long Id,
    string Name,
    string? Description,
    string? Website,
    long? CountryId,
    string? CountryName,
    int? FoundedYear,
    string? History,
    bool IsAlive,
    long? ImageId,
    string? Color,
    bool IsFeatured,
    bool IsActive,
    string? AvatarUrl);
