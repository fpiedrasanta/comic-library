using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class ChangePasswordApiRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string AuthorizationToken { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}