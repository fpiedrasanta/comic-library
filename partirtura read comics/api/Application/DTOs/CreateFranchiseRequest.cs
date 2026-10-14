namespace Application.DTOs;

public record CreateFranchiseRequest(
    string Name,
    string? Description,
    long PublisherId,
    string? Color,
    bool IsFeatured,
    bool IsOngoing,
    byte[]? AvatarData,
    string? AvatarFileName);
