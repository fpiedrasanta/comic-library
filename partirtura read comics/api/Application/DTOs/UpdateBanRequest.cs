namespace Application.DTOs;

public class UpdateBanRequest
{
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}
