namespace Application.DTOs;

public record ListResponse<T>(
    int CurrentPage,
    bool HasNextPage,
    bool HasPriorPage,
    int TotalPages,
    int PageSize,
    int? NextPage,
    int? PriorPage,
    int TotalCount,
    IReadOnlyList<T> Items);
