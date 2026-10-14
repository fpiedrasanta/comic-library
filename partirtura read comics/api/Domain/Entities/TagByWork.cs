namespace Domain.Entities;

public class TagByWork
{
    public long Id { get; set; }

    public virtual Work Work { get; set; } = null!;
    public virtual Tag Tag { get; set; } = null!;

    public long? GetTagId()
    {
        return this.Tag != null ? this.Tag.Id : null;
    }
    
    public string? GetTagName()
    {
        return this.Tag != null ? this.Tag.Name : null;
    }
}