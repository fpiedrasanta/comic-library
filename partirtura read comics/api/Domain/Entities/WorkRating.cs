namespace Domain.Entities;

public class WorkRating
{
    public long Id { get; set; }

    /// <summary>
    /// Score of the Work, from 0 to 5.
    /// 0 is a valid vote meaning "no star selected"; it is not the absence of a vote.
    /// The service normalizes a missing score to 0 before persisting.
    /// </summary>
    public int Stars { get; set; } = 0;

    /// <summary>
    /// Optional review. It can be null even when the rating has a score.
    /// A review always belongs to a vote: every WorkRating record is a vote for the Work.
    /// </summary>
    public string? Review { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date of the last modification; null while the rating has never been edited.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual User User { get; set; } = null!;

    public virtual Work Work { get; set; } = null!;
}
