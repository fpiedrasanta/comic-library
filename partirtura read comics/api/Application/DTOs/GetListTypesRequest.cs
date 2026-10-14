namespace Application.DTOs;

public class GetListTypesRequest : ListRequest
{
    public bool? isActive { get; set; }
}
