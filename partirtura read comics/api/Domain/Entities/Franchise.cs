namespace Domain.Entities;

public class Franchise
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsOngoing { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Publisher Publisher { get; set; } = null!;
    public virtual Image? Image { get; set; }

    public long? GetPublisherId() 
    {
        return this.Publisher != null ? this.Publisher.Id : null;
    }

    public string? GetPublisherName()
    {
        return this.Publisher != null ? this.Publisher.Name : null;
    }

    public string? GetPublisherCountryName()
    {
        return this.Publisher != null ? this.Publisher.GetCountryName() : null;
    }
}
