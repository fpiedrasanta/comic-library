namespace Application.DTOs;

public class GetSeriesRequest : ListRequest
{
    public long? PublisherId { get; set; }
    public long? FranchiseId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsOngoing { get; set; }
}
