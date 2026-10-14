namespace Application.DTOs;

public static class PaginationGuard
{
    public const int DefaultPageSize = 12;
    public const int MaxPageSize = 50;
    public const int CatalogFilterMaxPageSize = 24;
    public const int CatalogCardDefaultPageSize = 24;
    public const int CatalogCardMaxPageSize = 36;

    public static void Normalize(int defaultPageSize, int maxPageSize, ref int currentPage, ref int pageSize)
    {
        if (currentPage < 1) currentPage = 1;
        if (pageSize < 1) pageSize = defaultPageSize > 0 ? defaultPageSize : DefaultPageSize;
        if (pageSize > maxPageSize) pageSize = maxPageSize;
    }

    public static ListResponse<T> Build<T>(int currentPage, int pageSize, int totalCount, IReadOnlyList<T> items)
    {
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        return new ListResponse<T>(
            currentPage,
            currentPage < totalPages,
            currentPage > 1,
            totalPages,
            pageSize,
            currentPage < totalPages ? currentPage + 1 : null,
            currentPage > 1 ? currentPage - 1 : null,
            totalCount,
            items);
    }
}
