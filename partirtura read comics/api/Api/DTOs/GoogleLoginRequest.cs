using System.ComponentModel.DataAnnotations;

namespace Api.DTOs;

public class GoogleLoginRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
