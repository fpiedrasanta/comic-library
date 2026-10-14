using Microsoft.AspNetCore.Http;

namespace Api.DTOs;

public class UpdateAdminUserFormRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public long? CountryId { get; set; }
    public long? ImageId { get; set; }
    public IFormFile? Avatar { get; set; }
}
