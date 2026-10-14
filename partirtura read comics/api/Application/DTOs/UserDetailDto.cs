namespace Application.DTOs;

public record UserDetailDto(
    long Id,
    string FirstName,
    string LastName,
    string Email,
    string? AvatarUrl,
    string? CountryName);
