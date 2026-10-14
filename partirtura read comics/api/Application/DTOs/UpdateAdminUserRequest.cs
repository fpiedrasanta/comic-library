namespace Application.DTOs;

public class UpdateAdminUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public long? CountryId { get; set; }
    public long? ImageId { get; set; }
    public byte[]? AvatarData { get; set; }
    public string? AvatarFileName { get; set; }
}
