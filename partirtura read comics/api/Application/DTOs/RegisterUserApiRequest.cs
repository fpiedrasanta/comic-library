namespace Application.DTOs;

public record RegisterUserApiRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    long? NationalityId,
    byte[]? AvatarData,
    string? AvatarFileName);
