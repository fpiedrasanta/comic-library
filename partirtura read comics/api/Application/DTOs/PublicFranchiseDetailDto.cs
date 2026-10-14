namespace Application.DTOs;

public record PublicFranchiseDetailDto(
    long Id,
    string Name,
    string? Description,
    string? Color,
    string? UrlImage,
    long? PublisherId,
    string? PublisherName,
    string? PublisherColor);