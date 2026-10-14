namespace Application.DTOs;

public class GetTagsRequest : ListRequest
{
    public bool? isActive { get; set; }
}
