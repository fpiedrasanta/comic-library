namespace Domain.Entities;

public class ListRating
{
    public long Id { get; set; }

    /// <summary>
    /// Score of the list, from 1 to 5. Required.
    /// </summary>
    public int Stars { get; set; }

    /// <summary>
    /// Optional review of the list.
    /// </summary>
    public string? Review { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date of the last modification; null while the rating has never been edited.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual User User { get; set; } = null!;

    public virtual WorkList WorkList { get; set; } = null!;
}
