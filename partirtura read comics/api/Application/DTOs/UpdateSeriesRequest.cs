namespace Application.DTOs;

public record UpdateSeriesRequest(
    string Name,
    string? Description,
    long FranchiseId,
    long? ImageId,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    byte[]? AvatarData,
    string? AvatarFileName);
