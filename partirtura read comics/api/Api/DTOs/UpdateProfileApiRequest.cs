using Microsoft.AspNetCore.Http;

namespace Api.DTOs;

public class UpdateProfileApiRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public long? CountryId { get; set; }
    public long? ImageId { get; set; }
    public IFormFile? Avatar { get; set; }
}
