namespace Application.DTOs;

public class GetRolesRequest : ListRequest
{
    public bool? isActive { get; set; }
}
