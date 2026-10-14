using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public static class QueryablePagingExtensions
{
    public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> query, int currentPage, int pageSize)
    {
        if (currentPage < 1) currentPage = 1;
        if (pageSize < 1) pageSize = 1;
        return query.Skip((currentPage - 1) * pageSize).Take(pageSize);
    }

    public static async Task<(IReadOnlyList<T> Items, int TotalCount)> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int currentPage,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.ApplyPaging(currentPage, pageSize).ToListAsync(cancellationToken);
        return (items, totalCount);
    }
}
