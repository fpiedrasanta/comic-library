namespace Application.DTOs;

public record AdminPublisherListItemDto(
    long Id,
    string Name,
    string? CountryName,
    string? Color,
    string? UrlImage,
    bool IsAlive,
    bool IsFeatured,
    bool IsActive,
    DateTime CreatedAt);
