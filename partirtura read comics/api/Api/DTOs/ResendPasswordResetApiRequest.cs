using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class ResendPasswordResetApiRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}