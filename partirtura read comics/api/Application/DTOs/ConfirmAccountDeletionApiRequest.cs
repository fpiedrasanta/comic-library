using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ConfirmAccountDeletionApiRequest
{
    [Required]
    [StringLength(6, MinimumLength = 6)]
    [RegularExpression("^[0-9]+$")]
    public string Code { get; set; } = string.Empty;
}
