namespace Application.DTOs;

public class GetCountriesRequest : ListRequest
{
    public bool? IsActive { get; set; }
}
