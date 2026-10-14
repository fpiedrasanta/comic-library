using Microsoft.AspNetCore.Http;

namespace Api.DTOs;

public class RegisterUserFormRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public long? NationalityId { get; set; }
    public IFormFile? Avatar { get; set; }
}
