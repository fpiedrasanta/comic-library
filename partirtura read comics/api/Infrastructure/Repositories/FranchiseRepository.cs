using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class FranchiseRepository(ApplicationDbContext context) : IFranchiseRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Franchise?> GetByIdAsync(long franchiseId, CancellationToken cancellationToken = default)
    {
        return await _context.Franchises
            .FirstOrDefaultAsync(f => f.Id == franchiseId, cancellationToken);
    }

    public async Task<Franchise?> GetDetailByIdAsync(long franchiseId, CancellationToken cancellationToken = default)
    {
        return await _context.Franchises
            .AsNoTracking()
            .Include(f => f.Image)
            .Include(f => f.Publisher)
            .FirstOrDefaultAsync(f => f.Id == franchiseId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Franchise>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, long? publisherId, bool? isActive, bool? isFeatured, bool? isOngoing, CancellationToken cancellationToken = default)
    {
        var query = _context.Franchises.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(f =>
                EF.Functions.Like(f.Name, $"%{searchTerm}%") ||
                (f.Publisher != null && EF.Functions.Like(f.Publisher.Name, $"%{searchTerm}%")) ||
                (f.Publisher != null && f.Publisher.Country != null && EF.Functions.Like(f.Publisher.Country.Name, $"%{searchTerm}%")));
        }

        if (publisherId.HasValue)
        {
            query = query.Where(f => f.Publisher != null && f.Publisher.Id == publisherId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(f => f.IsActive == isActive.Value);
        }

        if (isFeatured.HasValue)
        {
            query = query.Where(f => f.IsFeatured == isFeatured.Value);
        }

        if (isOngoing.HasValue)
        {
            query = query.Where(f => f.IsOngoing == isOngoing.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Include(f => f.Publisher)
            .ThenInclude(p => p.Country)
            .Include(f => f.Image)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Franchise>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, long? publisherId = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Franchise> query = _context.Franchises
            .AsNoTracking()
            .Where(f => f.IsActive && f.Publisher.IsActive)
            .Where(f => _context.Works.Any(w => w.IsActive && (
                (w.Franchise != null && w.Franchise.Id == f.Id) ||
                (w.Series != null && w.Series.Franchise.Id == f.Id)
            )));

        if (publisherId.HasValue)
        {
            query = query.Where(f => f.Publisher.Id == publisherId.Value);
        }

        query = ApplyCatalogSearch(query, search);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(f => f.Name)
            .ThenBy(f => f.Id)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .Include(f => f.Image)
            .Include(f => f.Publisher)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(Franchise franchise, CancellationToken cancellationToken = default)
    {
        await _context.Franchises.AddAsync(franchise, cancellationToken);
    }

    public async Task UpdateAsync(Franchise franchise, CancellationToken cancellationToken = default)
    {
        _context.Franchises.Update(franchise);
    }

    private static IQueryable<Franchise> ApplyCatalogSearch(IQueryable<Franchise> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var pattern = $"%{search.Trim()}%";

        return query.Where(f =>
            EF.Functions.Like(f.Name, pattern) ||
            EF.Functions.Like(f.Publisher.Name, pattern));
    }

    private static IQueryable<Franchise> ApplyOrdering(IQueryable<Franchise> query, string? orderBy, string orderDir)
    {
        var descending = string.Equals(orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        var ordered = orderBy?.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(f => f.Name) : query.OrderBy(f => f.Name),
            "publishercountry" => descending
                ? query.OrderByDescending(f => f.Publisher != null && f.Publisher.Country != null ? f.Publisher.Country.Name : "")
                : query.OrderBy(f => f.Publisher != null && f.Publisher.Country != null ? f.Publisher.Country.Name : ""),
            "publishername" => descending
                ? query.OrderByDescending(f => f.Publisher != null ? f.Publisher.Name : "")
                : query.OrderBy(f => f.Publisher != null ? f.Publisher.Name : ""),
            _ => query.OrderBy(f => f.Name)
        };

        return ordered.ThenBy(f => f.Id);
    }
}
