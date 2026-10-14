using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class ListTypeRepository(ApplicationDbContext context) : IListTypeRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<ListType>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy, string orderDir, CancellationToken cancellationToken = default)
    {
        var query = _context.ListTypes.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(lt => EF.Functions.Like(lt.Name, $"%{searchTerm}%"));
        }

        if (isActive.HasValue)
        {
            query = query.Where(lt => lt.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<ListType?> GetByIdAsync(long listTypeId, CancellationToken cancellationToken = default)
    {
        return await _context.ListTypes
            .FirstOrDefaultAsync(lt => lt.Id == listTypeId, cancellationToken);
    }

    public async Task<ListType?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.ListTypes
            .FirstOrDefaultAsync(lt => lt.Name == name, cancellationToken);
    }

    public async Task AddAsync(ListType listType, CancellationToken cancellationToken = default)
    {
        await _context.ListTypes.AddAsync(listType, cancellationToken);
    }

    public async Task UpdateAsync(ListType listType, CancellationToken cancellationToken = default)
    {
        _context.ListTypes.Update(listType);
    }

    private IQueryable<ListType> ApplyOrdering(IQueryable<ListType> query, string? orderBy, string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
            return query.OrderBy(lt => lt.Name);

        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        return orderBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(lt => lt.Name) : query.OrderBy(lt => lt.Name),
            "createdat" => descending ? query.OrderByDescending(lt => lt.CreatedAt) : query.OrderBy(lt => lt.CreatedAt),
            "isactive" => descending ? query.OrderByDescending(lt => lt.IsActive) : query.OrderBy(lt => lt.IsActive),
            _ => query.OrderBy(lt => lt.Name)
        };
    }
}
