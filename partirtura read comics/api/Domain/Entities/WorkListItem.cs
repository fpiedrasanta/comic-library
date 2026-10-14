namespace Domain.Entities;

public class WorkListItem
{
    public long Id { get; set; }
    public virtual WorkList WorkList { get; set; } = null!;
    public virtual Work Work { get; set; } = null!;
    public int Position { get; set; }
}
