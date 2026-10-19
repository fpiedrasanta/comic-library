namespace Domain.Entities;

public class Favorite
{
    public long Id { get; set; }
    public virtual User User { get; set; } = null!;
    public virtual Work Work { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}
