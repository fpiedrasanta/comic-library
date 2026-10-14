using Domain.Enums;

namespace Domain.Entities;

public class WorkList
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public virtual Image? Cover { get; set; }
    public string? Color { get; set; }
    public virtual ListType ListType { get; set; } = null!;
    public OwnerType OwnerType { get; set; }
    public virtual User? Owner { get; set; }
    public Visibility Visibility { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<WorkListItem> WorkListItems { get; set; } = new List<WorkListItem>();
}
