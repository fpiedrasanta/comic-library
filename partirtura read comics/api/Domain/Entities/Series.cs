namespace Domain.Entities;

public class Series
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsOngoing { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual Franchise Franchise { get; set; } = null!;
    public virtual Image? Image { get; set; }

    public long? GetFranchiseId()
    {
        return this.Franchise != null ? this.Franchise.Id : null;
    }

    public string? GetFranchiseName()
    {
        return this.Franchise != null ? this.Franchise.Name : null;
    }

    public long? GetPublisherId()
    {
        return this.Franchise != null ? this.Franchise.GetPublisherId() : null;
    }

    public string? GetPublisherName()
    {
        return this.Franchise != null ? this.Franchise.GetPublisherName() : null;
    }

    public string? GetPublisherCountryName() 
    {
        return this.Franchise != null ? this.Franchise.GetPublisherCountryName() : null;
    }
}
