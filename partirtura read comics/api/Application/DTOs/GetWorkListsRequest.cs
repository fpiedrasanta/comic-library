namespace Application.DTOs;

public class GetWorkListsRequest : ListRequest
{
    public bool? isActive { get; set; }
    public long? franchiseId { get; set; }
    public long? publisherId { get; set; }
    public long? listTypeId { get; set; }
    public DateTime? createdAtFrom { get; set; }
    public DateTime? createdAtTo { get; set; }
}
