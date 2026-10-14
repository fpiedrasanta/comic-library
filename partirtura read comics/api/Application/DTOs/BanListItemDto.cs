namespace Application.DTOs;

public record BanListItemDto(
    long Id,
    long UserId,
    string FirstName,
    string LastName,
    string Email,
    string? AvatarUrl,
    DateTime CreatedAt,
    DateTime StartDate,
    DateTime? EndDate,
    string Reason,
    bool IsActive,
    string Status);
