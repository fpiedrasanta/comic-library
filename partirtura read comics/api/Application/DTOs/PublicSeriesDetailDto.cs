namespace Application.DTOs;

public record PublicSeriesNodeDto(
    long Id,
    string Name,
    string? Color);

public record PublicSeriesDetailDto(
    long Id,
    string Name,
    string? Description,
    string? Color,
    string? UrlImage,
    PublicSeriesNodeDto? Franchise,
    PublicSeriesNodeDto? Publisher);