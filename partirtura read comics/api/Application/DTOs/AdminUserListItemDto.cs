namespace Application.DTOs;

public record AdminUserListItemDto(
    long Id,
    string FirstName,
    string LastName,
    string Email,
    string? AvatarUrl,
    string? CountryName,
    DateTime CreatedAt,
    bool IsActive);
