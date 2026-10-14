namespace Application.DTOs;

public record AdminUserDetailDto(
    long Id,
    string FirstName,
    string LastName,
    string Email,
    long? CountryId,
    string? CountryName,
    string? AvatarUrl,
    bool IsActive);
