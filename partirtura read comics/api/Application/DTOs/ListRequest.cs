using Application.Constants;

namespace Application.DTOs;

public class ListRequest
{
    public int currentPage { get; set; }= 1;
    public int pageSize { get; set; }= 12;
    public string? orderBy { get; set; }= null;
    public string orderDir { get; set; } = SortDirection.ASC;
    public string? search { get; set; } = null;
}
