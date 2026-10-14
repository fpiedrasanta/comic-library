using Microsoft.AspNetCore.Http;

namespace Api.DTOs;

public class UpdatePublisherFormRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public long? CountryId { get; set; }
    public int? FoundedYear { get; set; }
    public string? History { get; set; }
    public bool IsAlive { get; set; }
    public long? ImageId { get; set; }
    public IFormFile? Avatar { get; set; }
    public string? Color { get; set; }
    public bool IsFeatured { get; set; }
}
