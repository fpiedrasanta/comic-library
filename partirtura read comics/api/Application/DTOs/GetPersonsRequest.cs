namespace Application.DTOs;

public class GetPersonsRequest : ListRequest
{
    public bool? isActive { get; set; }
}
