using Microsoft.AspNetCore.Http;

namespace Api.DTOs;

public class CreateFranchiseFormRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public long PublisherId { get; set; }
    public string? Color { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsOngoing { get; set; }
    public IFormFile? Avatar { get; set; }
}
