namespace Domain.Entities;

public class ListReadingProgress
{
    public long Id { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual WorkList WorkList { get; set; } = null!;

    /// <summary>
    /// Work of the list the user is currently reading. Null when the user has not started
    /// the list or has finished it. It must belong to the list; the rules for updating it
    /// when the list composition changes belong to the service layer.
    /// </summary>
    public virtual Work? CurrentWork { get; set; }

    public DateTimeOffset? LastReadAt { get; set; }
}
