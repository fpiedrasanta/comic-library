namespace Domain.Entities;

public class PersonByRole
{
    public long Id { get; set; }
    
    public virtual Work Work { get; set; } = null!;
    public virtual Person Person { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;

    public long? GetPersonId()
    {
        return this.Person != null ? this.Person.Id : null;
    }

    public string? GetPersonName()
    {
        return this.Person != null ? this.Person.Name : null;
    }

    public long? GetRoleId()
    {
        return this.Role != null ? this.Role.Id : null;
    }

    public string? GetRoleName()
    {
        return this.Role != null ? this.Role.Name : null;
    }
}