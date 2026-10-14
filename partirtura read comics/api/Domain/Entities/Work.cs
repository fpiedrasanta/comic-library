using Domain.Enums;

namespace Domain.Entities;

public class Work
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? PublicationDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ContentStatus ContentStatus { get; set; } = ContentStatus.Missing;
    public string? ContentError { get; set; }
    public bool IARequest { get; set; }
    public IAProcessingStatus? IAStatus { get; set; }
    public string? IAResult { get; set; }
    public DateTimeOffset? IARequestedAt { get; set; }

    public virtual Language? Language { get; set; }
    public virtual Image? Cover { get; set; }
    public virtual File? File { get; set; }

    public virtual ICollection<PersonByRole> PersonByRoles { get; set; } = new List<PersonByRole>();
    public virtual ICollection<TagByWork> Tags { get; set; } = new List<TagByWork>();
    public virtual ICollection<Page> Pages { get; set; } = new List<Page>();

    public virtual WorkType? WorkType { get; set; }
    public virtual Series? Series { get; set; }
    
    public virtual Franchise? Franchise { get; set; }
    
    public virtual Publisher? Publisher { get; set; }
    
    public string? NumberValue { get; set; }

    /// <summary>
    /// Number of ratings for this Work (zero-star votes included).
    /// Maintained by WorkRatingService when a vote is created; unchanged when a vote is edited.
    /// </summary>
    public int RatingCount { get; set; } = 0;

    /// <summary>
    /// Average of the received scores on a 0-5 scale (zero-star votes included).
    /// Maintained by WorkRatingService when a vote is created or its score changes.
    /// </summary>
    public double AverageRating { get; set; } = 0.0;

    public virtual Work? PreviousNumber { get; set; }
    
    public virtual Work? NextNumber { get; set; }
    
    public virtual long? GetSeriesId()
    {
        return this.Series != null ? this.Series.Id : null;
    }

    public virtual string? GetSeriesName()
    {
        return this.Series != null ? this.Series.Name : null;
    }

    public virtual long? GetFranchiseId()
    {
        if (this.Franchise != null)
            return this.Franchise.Id;
        if (this.Series != null)
            return this.Series.GetFranchiseId();
        return null;
    }

    public virtual string? GetFranchiseName()
    {
        if (this.Franchise != null)
            return this.Franchise.Name;
        if (this.Series != null)
            return this.Series.GetFranchiseName();
        return null;
    }

    public virtual long? GetPublisherId()
    {
        if (this.Publisher != null)
            return this.Publisher.Id;
        if (this.Franchise != null)
            return this.Franchise.GetPublisherId();
        if (this.Series != null)
            return this.Series.GetPublisherId();
        return null;
    }

    public virtual string? GetPublisherName()
    {
        if (this.Publisher != null)
            return this.Publisher.Name;
        if (this.Franchise != null)
            return this.Franchise.GetPublisherName();
        if (this.Series != null)
            return this.Series.GetPublisherName();
        return null;
    }

    public virtual string? GetPublisherCountryName()
    {
        if (this.Publisher != null)
            return this.Publisher.GetCountryName();
        if (this.Franchise != null)
            return this.Franchise.GetPublisherCountryName();
        if (this.Series != null)
            return this.Series.GetPublisherCountryName();
        return null;
    }

    public virtual long? GetPreviousNumberId()
    {
        return this.PreviousNumber != null ? this.PreviousNumber.Id : null;
    }

    public virtual string? GetPreviousNumberTitle()
    {
        return this.PreviousNumber != null ? this.PreviousNumber.Title : null;
    }

    public virtual string? GetPreviousNumberValue()
    {
        return this.PreviousNumber != null ? this.PreviousNumber.NumberValue : null;
    }

    public virtual long? GetNextNumberId()
    {
        return this.NextNumber != null ? this.NextNumber.Id : null;
    }

    public virtual string? GetNextNumberTitle()
    {
        return this.NextNumber != null ? this.NextNumber.Title : null;
    }

    public virtual string? GetNextNumberValue()
    {
        return this.NextNumber != null ? this.NextNumber.NumberValue : null;
    }

    public long? GetFileId()
    {
        return this.File != null ? this.File.Id : null;
    }

    public long GetPagesCount()
    {
        return this.Pages != null ? this.Pages.Count : 0;
    }

    public long? GetLanguageId()
    {
        return this.Language != null ? this.Language.Id : null;
    }

    public string? GetLanguageName()
    {
        return this.Language != null ? this.Language.Name : null;
    }

    public long? GetCoverId()
    {
        return this.Cover != null ? this.Cover.Id : null;
    }

    public string? GetWorkTypeName()
    {
        return this.WorkType?.Name;
    }
}