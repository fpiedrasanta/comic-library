namespace Domain.Entities;

public class RefreshToken
{
    public long Id { get; set; }
    public virtual User User { get; set; } = null!;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsUsed { get; set; }
}