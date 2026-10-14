using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class RequestPasswordResetApiRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}