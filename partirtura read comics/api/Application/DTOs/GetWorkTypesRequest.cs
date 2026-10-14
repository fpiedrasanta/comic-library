namespace Application.DTOs;

public class GetWorkTypesRequest : ListRequest
{
    public bool? isActive { get; set; }
}