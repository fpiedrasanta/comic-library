using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class SeriesRepository(ApplicationDbContext context) : ISeriesRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Series?> GetByIdAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        return await _context.Series
            .FirstOrDefaultAsync(s => s.Id == seriesId, cancellationToken);
    }

    public async Task<Series?> GetDetailByIdAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        return await _context.Series
            .AsNoTracking()
            .Include(s => s.Image)
            .Include(s => s.Franchise)
            .ThenInclude(f => f.Publisher)
            .FirstOrDefaultAsync(s => s.Id == seriesId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Series>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, long? publisherId, long? franchiseId, bool? isActive, bool? isFeatured, bool? isOngoing, CancellationToken cancellationToken = default)
    {
        var query = _context.Series.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(s =>
                EF.Functions.Like(s.Name, $"%{searchTerm}%") ||
                (s.Franchise != null && EF.Functions.Like(s.Franchise.Name, $"%{searchTerm}%")) ||
                (s.Franchise != null && s.Franchise.Publisher != null && EF.Functions.Like(s.Franchise.Publisher.Name, $"%{searchTerm}%")));
        }

        if (publisherId.HasValue)
        {
            query = query.Where(s => s.Franchise != null && s.Franchise.Publisher != null && s.Franchise.Publisher.Id == publisherId.Value);
        }

        if (franchiseId.HasValue)
        {
            query = query.Where(s => s.Franchise != null && s.Franchise.Id == franchiseId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        if (isFeatured.HasValue)
        {
            query = query.Where(s => s.IsFeatured == isFeatured.Value);
        }

        if (isOngoing.HasValue)
        {
            query = query.Where(s => s.IsOngoing == isOngoing.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Include(s => s.Franchise)
            .ThenInclude(f => f.Publisher)
            .ThenInclude(p => p.Country)
            .Include(s => s.Franchise.Image)
            .Include(s => s.Image)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Series>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, CancellationToken cancellationToken = default)
    {
        IQueryable<Series> query = _context.Series
            .AsNoTracking()
            .Where(s => s.IsActive && s.Franchise.IsActive && s.Franchise.Publisher.IsActive)
            .Where(s => _context.Works.Any(w => w.IsActive && w.Series != null && w.Series.Id == s.Id));

        query = ApplyCatalogSearch(query, search);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.Name)
            .ThenBy(s => s.Id)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .Include(s => s.Image)
            .Include(s => s.Franchise).ThenInclude(f => f.Publisher)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<bool> ExistsAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        return await _context.Series.AnyAsync(s => s.Id == seriesId, cancellationToken);
    }

    public async Task AddAsync(Series series, CancellationToken cancellationToken = default)
    {
        await _context.Series.AddAsync(series, cancellationToken);
    }

    public async Task UpdateAsync(Series series, CancellationToken cancellationToken = default)
    {
        _context.Series.Update(series);
    }

    private static IQueryable<Series> ApplyCatalogSearch(IQueryable<Series> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var pattern = $"%{search.Trim()}%";

        return query.Where(s =>
            EF.Functions.Like(s.Name, pattern) ||
            EF.Functions.Like(s.Franchise.Name, pattern) ||
            EF.Functions.Like(s.Franchise.Publisher.Name, pattern));
    }

    private static IQueryable<Series> ApplyOrdering(IQueryable<Series> query, string? orderBy, string orderDir)
    {
        var descending = string.Equals(orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        var ordered = orderBy?.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "franchise" => descending
                ? query.OrderByDescending(s => s.Franchise != null ? s.Franchise.Name : "")
                : query.OrderBy(s => s.Franchise != null ? s.Franchise.Name : ""),
            "publisher" => descending
                ? query.OrderByDescending(s => s.Franchise != null && s.Franchise.Publisher != null ? s.Franchise.Publisher.Name : "")
                : query.OrderBy(s => s.Franchise != null && s.Franchise.Publisher != null ? s.Franchise.Publisher.Name : ""),
            "country" => descending
                ? query.OrderByDescending(s => s.Franchise != null && s.Franchise.Publisher != null && s.Franchise.Publisher.Country != null ? s.Franchise.Publisher.Country.Name : "")
                : query.OrderBy(s => s.Franchise != null && s.Franchise.Publisher != null && s.Franchise.Publisher.Country != null ? s.Franchise.Publisher.Country.Name : ""),
            _ => query.OrderBy(s => s.Name)
        };

        return ordered.ThenBy(s => s.Id);
    }
}
