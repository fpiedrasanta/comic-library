using Microsoft.AspNetCore.Http;

namespace Api.DTOs;

public class CreateAdminUserFormRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public long? CountryId { get; set; }
    public string Password { get; set; } = string.Empty;
    public IFormFile? Avatar { get; set; }
}
