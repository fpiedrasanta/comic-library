namespace Api.DTOs;

public class EnsurePersonRoleRequest
{
    public string PersonName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}

public class EnsurePersonRoleResponse
{
    public PersonResponse Person { get; set; } = new();
    public RoleResponse Role { get; set; } = new();
}

public class PersonResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class RoleResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
}