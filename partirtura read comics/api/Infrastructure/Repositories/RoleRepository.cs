using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class RoleRepository(ApplicationDbContext context) : IRoleRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<Role>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy, string orderDir, CancellationToken cancellationToken = default)
    {
        var query = _context.Roles.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(r => EF.Functions.Like(r.Name, $"%{searchTerm}%"));
        }

        if (isActive.HasValue)
        {
            query = query.Where(r => r.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Role?> GetByIdAsync(long roleId, CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);
    }

    public async Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => EF.Functions.Like(r.Name, name), cancellationToken);
    }

    public async Task AddAsync(Role role, CancellationToken cancellationToken = default)
    {
        await _context.Roles.AddAsync(role, cancellationToken);
    }

    public async Task UpdateAsync(Role role, CancellationToken cancellationToken = default)
    {
        _context.Roles.Update(role);
    }

    private IQueryable<Role> ApplyOrdering(IQueryable<Role> query, string? orderBy, string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
            return query.OrderBy(r => r.Name);

        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        return orderBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name),
            "createdat" => descending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
            _ => query.OrderBy(r => r.Name)
        };
    }
}
