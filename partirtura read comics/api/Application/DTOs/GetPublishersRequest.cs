namespace Application.DTOs;

public class GetPublishersRequest : ListRequest
{
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsAlive { get; set; }
}
