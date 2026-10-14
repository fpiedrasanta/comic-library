namespace Application.DTOs;

public record CreateSeriesRequest(
    string Name,
    string? Description,
    long FranchiseId,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    byte[]? AvatarData,
    string? AvatarFileName);
