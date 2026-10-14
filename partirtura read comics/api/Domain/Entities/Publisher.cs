namespace Domain.Entities;

public class Publisher
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public int? FoundedYear { get; set; }
    public string? History { get; set; }
    public bool IsAlive { get; set; }
    public string? Color { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Country? Country { get; set; }
    public virtual Image? Image { get; set; }

    public string? GetCountryName()
    {
        return this.Country != null ? this.Country.Name : null;
    }
}
