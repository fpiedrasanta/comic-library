namespace Application.DTOs;

public record UserListItemDto(
    long Id,
    string FirstName,
    string LastName,
    string Email,
    string? AvatarUrl,
    string? CountryName,
    bool IsActive,
    bool IsBanned,
    int BanCount,
    DateTime CreatedAt);
