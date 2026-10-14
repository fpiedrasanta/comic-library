namespace Application.DTOs;

public record UserProfileResponse(long Id, string FirstName, string LastName, string Email, string? AvatarUrl, long? CountryId, string? CountryName, string Role);
