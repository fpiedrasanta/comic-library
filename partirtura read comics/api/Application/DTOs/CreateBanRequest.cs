namespace Application.DTOs;

public class CreateBanRequest
{
    public long UserId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}
