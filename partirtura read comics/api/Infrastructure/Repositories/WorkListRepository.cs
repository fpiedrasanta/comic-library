using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Infrastructure.Repositories;

public class WorkListRepository(ApplicationDbContext context) : IWorkListRepository
{
    private const string OrderByName = "name";
    private const string OrderByCreatedAt = "createdat";
    private const string SystemVisibility = "system";

    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<WorkList>, int)> GetPagedAsync(
        int currentPage,
        int pageSize,
        string? search,
        bool? isActive,
        long? franchiseId,
        long? publisherId,
        long? listTypeId,
        DateTime? createdAtFrom,
        DateTime? createdAtTo,
        string? orderBy,
        string orderDir,
        CancellationToken cancellationToken = default)
    {
        var query = _context.WorkLists
            .AsNoTracking()
            .Include(workList => workList.ListType)
            .Include(workList => workList.Cover)
            .AsSplitQuery()
            .Where(workList => workList.OwnerType == OwnerType.System);

        query = ApplySearch(query, search);
        query = ApplyFilters(query, isActive, franchiseId, publisherId, listTypeId, createdAtFrom, createdAtTo);

        var totalCount = await query.CountAsync(cancellationToken);
        query = ApplyOrdering(query, orderBy, orderDir);
        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<WorkList>, int)> GetCatalogPagedAsync(
        int currentPage,
        int pageSize,
        string? search,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        long? listTypeId,
        string? orderBy,
        string? orderDir,
        CancellationToken cancellationToken = default)
    {
        var query = _context.WorkLists
            .AsNoTracking()
            .Include(workList => workList.ListType)
            .Include(workList => workList.Cover)
            .AsSplitQuery()
            .Where(workList => workList.IsActive && workList.OwnerType == OwnerType.System);

        query = ApplyCatalogSearch(query, search);
        query = ApplyCatalogHierarchy(query, publisherId, franchiseId, seriesId);
        query = ApplyCatalogListType(query, listTypeId);

        var totalCount = await query.CountAsync(cancellationToken);
        query = ApplyCatalogOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return (items, totalCount);
    }

    public async Task<WorkList?> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkLists
            .AsNoTracking()
            .Include(workList => workList.ListType)
            .Include(workList => workList.Cover)
            .Include(workList => workList.WorkListItems)
                .ThenInclude(workItem => workItem.Work)
                .ThenInclude(work => work.WorkType)
            .Include(workList => workList.WorkListItems)
                .ThenInclude(workItem => workItem.Work)
                .ThenInclude(work => work.Cover)
            .Include(workList => workList.WorkListItems)
                .ThenInclude(workItem => workItem.Work)
                .ThenInclude(work => work.Series)
                .ThenInclude(series => series!.Franchise)
                .ThenInclude(franchise => franchise.Publisher)
            .Include(workList => workList.WorkListItems)
                .ThenInclude(workItem => workItem.Work)
                .ThenInclude(work => work.Franchise)
                .ThenInclude(franchise => franchise!.Publisher)
            .Include(workList => workList.WorkListItems)
                .ThenInclude(workItem => workItem.Work)
                .ThenInclude(work => work.Publisher)
            .AsSplitQuery()
            .FirstOrDefaultAsync(workList => workList.Id == id && workList.IsActive && workList.OwnerType == OwnerType.System, cancellationToken);
    }

    public async Task<WorkList?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkLists
            .FirstOrDefaultAsync(workList => workList.Id == id, cancellationToken);
    }

    public async Task<WorkList?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.WorkLists
            .FirstOrDefaultAsync(workList => workList.Name == name, cancellationToken);
    }

    public async Task AddAsync(WorkList workList, CancellationToken cancellationToken = default)
    {
        await _context.WorkLists.AddAsync(workList, cancellationToken);
    }

    public Task UpdateAsync(WorkList workList, CancellationToken cancellationToken = default)
    {
        _context.WorkLists.Update(workList);
        return Task.CompletedTask;
    }

    private static IQueryable<WorkList> ApplySearch(IQueryable<WorkList> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var searchTerm = search.Trim();
        return query.Where(workList =>
            EF.Functions.Like(workList.Name, $"%{searchTerm}%") ||
            workList.WorkListItems.Any(workItem =>
                EF.Functions.Like(workItem.Work.Title, $"%{searchTerm}%") ||
                (workItem.Work.NumberValue != null &&
                 EF.Functions.Like(workItem.Work.NumberValue, $"%{searchTerm}%"))));
    }

    private static IQueryable<WorkList> ApplyFilters(
        IQueryable<WorkList> query,
        bool? isActive,
        long? franchiseId,
        long? publisherId,
        long? listTypeId,
        DateTime? createdAtFrom,
        DateTime? createdAtTo)
    {
        if (isActive.HasValue)
        {
            query = query.Where(workList => workList.IsActive == isActive.Value);
        }

        if (franchiseId.HasValue)
        {
            query = query.Where(workList => workList.WorkListItems.Any(workItem =>
                (workItem.Work.Franchise != null && workItem.Work.Franchise.Id == franchiseId.Value) ||
                (workItem.Work.Series != null && workItem.Work.Series.Franchise != null && workItem.Work.Series.Franchise.Id == franchiseId.Value)));
        }

        if (publisherId.HasValue)
        {
            query = query.Where(workList => workList.WorkListItems.Any(workItem =>
                (workItem.Work.Franchise != null && workItem.Work.Franchise.Publisher != null && workItem.Work.Franchise.Publisher.Id == publisherId.Value) ||
                (workItem.Work.Series != null && workItem.Work.Series.Franchise != null && workItem.Work.Series.Franchise.Publisher != null && workItem.Work.Series.Franchise.Publisher.Id == publisherId.Value)));
        }

        if (listTypeId.HasValue)
        {
            query = query.Where(workList => workList.ListType.Id == listTypeId.Value);
        }

        if (createdAtFrom.HasValue)
        {
            query = query.Where(workList => workList.CreatedAt >= createdAtFrom.Value);
        }

        if (createdAtTo.HasValue)
        {
            query = query.Where(workList => workList.CreatedAt <= createdAtTo.Value);
        }

        return query;
    }

    private static IQueryable<WorkList> ApplyOrdering(
        IQueryable<WorkList> query,
        string? orderBy,
        string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
        {
            return query.OrderBy(workList => workList.Name);
        }

        var direction = string.IsNullOrWhiteSpace(orderDir) ? SortDirection.ASC : orderDir;
        var descending = direction.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);
        return orderBy.Trim().ToLowerInvariant() switch
        {
            "name" => descending
                ? query.OrderByDescending(workList => workList.Name)
                : query.OrderBy(workList => workList.Name),
            "createdat" => descending
                ? query.OrderByDescending(workList => workList.CreatedAt)
                : query.OrderBy(workList => workList.CreatedAt),
            _ => query.OrderBy(workList => workList.Name)
        };
    }

    private static IQueryable<WorkList> ApplyCatalogSearch(IQueryable<WorkList> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var pattern = $"%{search.Trim()}%";

        return query.Where(workList =>
            EF.Functions.Like(workList.Name, pattern) ||
            (workList.Description != null && EF.Functions.Like(workList.Description, pattern)));
    }

    private static IQueryable<WorkList> ApplyCatalogHierarchy(
        IQueryable<WorkList> query,
        long? publisherId,
        long? franchiseId,
        long? seriesId)
    {
        if (publisherId.HasValue)
        {
            query = query.Where(workList => workList.WorkListItems.Any(workItem =>
                (workItem.Work.Franchise != null && workItem.Work.Franchise.Publisher != null && workItem.Work.Franchise.Publisher.Id == publisherId.Value) ||
                (workItem.Work.Series != null && workItem.Work.Series.Franchise != null && workItem.Work.Series.Franchise.Publisher != null && workItem.Work.Series.Franchise.Publisher.Id == publisherId.Value) ||
                (workItem.Work.Publisher != null && workItem.Work.Publisher.Id == publisherId.Value)));
        }

        if (franchiseId.HasValue)
        {
            query = query.Where(workList => workList.WorkListItems.Any(workItem =>
                (workItem.Work.Franchise != null && workItem.Work.Franchise.Id == franchiseId.Value) ||
                (workItem.Work.Series != null && workItem.Work.Series.Franchise != null && workItem.Work.Series.Franchise.Id == franchiseId.Value)));
        }

        if (seriesId.HasValue)
        {
            query = query.Where(workList => workList.WorkListItems.Any(workItem =>
                workItem.Work.Series != null && workItem.Work.Series.Id == seriesId.Value));
        }

        return query;
    }

    private static IQueryable<WorkList> ApplyCatalogListType(IQueryable<WorkList> query, long? listTypeId)
    {
        return listTypeId.HasValue
            ? query.Where(workList => workList.ListType.Id == listTypeId.Value)
            : query;
    }

    private static IQueryable<WorkList> ApplyCatalogOrdering(
        IQueryable<WorkList> query,
        string? orderBy,
        string? orderDir)
    {
        var direction = string.IsNullOrWhiteSpace(orderDir) ? SortDirection.ASC : orderDir;
        var descending = direction.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        return orderBy?.Trim().ToLowerInvariant() switch
        {
            OrderByName => descending
                ? query.OrderByDescending(workList => workList.Name)
                : query.OrderBy(workList => workList.Name),
            OrderByCreatedAt => descending
                ? query.OrderByDescending(workList => workList.CreatedAt)
                : query.OrderBy(workList => workList.CreatedAt),
            _ => query.OrderByDescending(workList => workList.CreatedAt)
        };
    }
}