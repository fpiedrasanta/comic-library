namespace Application.DTOs;

public record BanDetailDto(
    long Id,
    long UserId,
    string FirstName,
    string LastName,
    string Email,
    string? AvatarUrl,
    DateTime StartDate,
    DateTime? EndDate,
    string Reason,
    bool IsActive,
    DateTime CreatedAt);
