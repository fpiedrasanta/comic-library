namespace Domain.Entities;

public class Page
{
    public long Id { get; set; }
    public int Order { get; set; }

    public virtual Work Work { get; set; } = null!;
    public virtual Image Image { get; set; } = null!;
}