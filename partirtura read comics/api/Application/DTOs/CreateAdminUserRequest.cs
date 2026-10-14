namespace Application.DTOs;

public class CreateAdminUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public long? CountryId { get; set; }
    public string Password { get; set; } = string.Empty;
    public byte[]? AvatarData { get; set; }
    public string? AvatarFileName { get; set; }
}
