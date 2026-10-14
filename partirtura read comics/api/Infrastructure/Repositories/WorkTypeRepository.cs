using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class WorkTypeRepository(ApplicationDbContext context) : IWorkTypeRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<WorkType> Items, int TotalCount)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy, string orderDir, CancellationToken cancellationToken = default)
    {
        var query = _context.WorkTypes.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(wt => EF.Functions.Like(wt.Name, $"%{searchTerm}%"));
        }

        if (isActive.HasValue)
        {
            query = query.Where(wt => wt.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<WorkType?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkTypes
            .FirstOrDefaultAsync(wt => wt.Id == id, cancellationToken);
    }

    public async Task<WorkType?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.WorkTypes
            .FirstOrDefaultAsync(wt => wt.Name == name, cancellationToken);
    }

    public async Task AddAsync(WorkType workType, CancellationToken cancellationToken = default)
    {
        await _context.WorkTypes.AddAsync(workType, cancellationToken);
    }

    public async Task UpdateAsync(WorkType workType, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        _context.WorkTypes.Update(workType);
    }

    public async Task<bool> ExistsAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkTypes
            .AsNoTracking()
            .AnyAsync(wt => wt.Id == id, cancellationToken);
    }

    public async Task<bool> IsActiveAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkTypes
            .AsNoTracking()
            .Where(wt => wt.Id == id)
            .Select(wt => wt.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private IQueryable<WorkType> ApplyOrdering(IQueryable<WorkType> query, string? orderBy, string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
            return query.OrderBy(wt => wt.Name).ThenBy(wt => wt.Id);

        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        var ordered = orderBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(wt => wt.Name) : query.OrderBy(wt => wt.Name),
            "createdat" => descending ? query.OrderByDescending(wt => wt.CreatedAt) : query.OrderBy(wt => wt.CreatedAt),
            "isactive" => descending ? query.OrderByDescending(wt => wt.IsActive) : query.OrderBy(wt => wt.IsActive),
            _ => query.OrderBy(wt => wt.Name)
        };

        return ordered.ThenBy(wt => wt.Id);
    }
}