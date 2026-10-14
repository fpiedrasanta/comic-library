using Application.Interfaces;
using Domain.Entities;
using Application.Constants;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class PublisherRepository(ApplicationDbContext context) : IPublisherRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Publisher?> GetByIdAsync(long publisherId, CancellationToken cancellationToken = default)
    {
        return await _context.Publishers
            .FirstOrDefaultAsync(p => p.Id == publisherId, cancellationToken);
    }

    public async Task<Publisher?> GetDetailByIdAsync(long publisherId, CancellationToken cancellationToken = default)
    {
        return await _context.Publishers
            .AsNoTracking()
            .Include(p => p.Country)
            .Include(p => p.Image)
            .FirstOrDefaultAsync(p => p.Id == publisherId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Publisher>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, bool? isActive, bool? isFeatured, bool? isAlive, CancellationToken cancellationToken = default)
    {
        var query = _context.Publishers.AsNoTracking().AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        if (isFeatured.HasValue)
        {
            query = query.Where(p => p.IsFeatured == isFeatured.Value);
        }

        if (isAlive.HasValue)
        {
            query = query.Where(p => p.IsAlive == isAlive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(p => EF.Functions.Like(p.Name, $"%{search}%") || (p.Country != null && EF.Functions.Like(p.Country.Name, $"%{search}%")));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.Country)
            .Include(p => p.Image)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Publisher>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, CancellationToken cancellationToken = default)
    {
        IQueryable<Publisher> query = _context.Publishers
            .AsNoTracking()
            .Where(p => p.IsActive);

        query = ApplyCatalogSearch(query, search);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .ThenBy(p => p.Id)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.Image)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Publisher?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Publishers
            .FirstOrDefaultAsync(p => p.Name == name, cancellationToken);
    }

    public async Task AddAsync(Publisher publisher, CancellationToken cancellationToken = default)
    {
        _context.Publishers.Add(publisher);
    }

    public async Task UpdateAsync(Publisher publisher, CancellationToken cancellationToken = default)
    {
        _context.Publishers.Update(publisher);
    }

    private static IQueryable<Publisher> ApplyCatalogSearch(IQueryable<Publisher> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var pattern = $"%{search.Trim()}%";

        return query.Where(p => EF.Functions.Like(p.Name, pattern));
    }

    private IQueryable<Publisher> ApplyOrdering(IQueryable<Publisher> query, string? orderBy, string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
            return query.OrderBy(p => p.Name).ThenBy(p => p.Id);

        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        var ordered = orderBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "country" => descending ? query.OrderByDescending(p => p.Country != null ? p.Country.Name : "") : query.OrderBy(p => p.Country != null ? p.Country.Name : ""),
            _ => query.OrderBy(p => p.Name)
        };

        return ordered.ThenBy(p => p.Id);
    }
}
