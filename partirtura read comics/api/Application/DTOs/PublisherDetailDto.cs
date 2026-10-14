namespace Application.DTOs;

public record PublisherDetailDto(
    long Id,
    string Name,
    string? Color,
    string? UrlImage,
    string? CountryName,
    int? FoundedYear,
    string? Website,
    string? Description,
    string? History);