namespace Application.DTOs;

public class GetUsersRequest : ListRequest
{
    public bool? IsActive { get; set; }
    public bool? IsBanned { get; set; }
}
