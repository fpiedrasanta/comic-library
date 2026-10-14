namespace Application.DTOs;

public record UpdateFranchiseRequest(
    string Name,
    string? Description,
    long PublisherId,
    long? ImageId,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    byte[]? AvatarData,
    string? AvatarFileName);
