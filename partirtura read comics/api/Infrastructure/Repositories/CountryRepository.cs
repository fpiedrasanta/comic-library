using Application.Interfaces;
using Domain.Entities;
using Application.Constants;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class CountryRepository(ApplicationDbContext context) : ICountryRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Country?> GetByIdAsync(long countryId, CancellationToken cancellationToken = default)
    {
        return await _context.Countries
            .FirstOrDefaultAsync(c => c.Id == countryId, cancellationToken);
    }

    public async Task<(IReadOnlyList<Country>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, bool? isActive, CancellationToken cancellationToken = default)
    {
        var query = _context.Countries.AsNoTracking().AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(c => EF.Functions.Like(c.Code, $"%{search}%") || EF.Functions.Like(c.Name, $"%{search}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Country?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Countries
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken);
    }

    public async Task<Country?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Countries
            .FirstOrDefaultAsync(c => c.Name == name, cancellationToken);
    }

    public async Task AddAsync(Country country, CancellationToken cancellationToken = default)
    {
        _context.Countries.Add(country);
    }

    public async Task UpdateAsync(Country country, CancellationToken cancellationToken = default)
    {
        _context.Countries.Update(country);
    }

    private IQueryable<Country> ApplyOrdering(IQueryable<Country> query, string? orderBy, string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
            return query.OrderBy(c => c.Name);

        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        return orderBy.ToLowerInvariant() switch
        {
            "code" => descending ? query.OrderByDescending(c => c.Code) : query.OrderBy(c => c.Code),
            "name" => descending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "isactive" => descending ? query.OrderByDescending(c => c.IsActive) : query.OrderBy(c => c.IsActive),
            _ => query.OrderBy(c => c.Name)
        };
    }
}
