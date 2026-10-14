namespace Application.DTOs;

public record UpdateProfileRequest(string FirstName, string LastName, long? CountryId, long? ImageId, byte[]? AvatarData, string? AvatarFileName);
