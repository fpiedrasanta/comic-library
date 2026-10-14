namespace Application.DTOs;

public class GetFranchisesRequest : ListRequest
{
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsOngoing { get; set; }
}
