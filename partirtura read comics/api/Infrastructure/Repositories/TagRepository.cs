using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class TagRepository(ApplicationDbContext context) : ITagRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<Tag>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy, string orderDir, CancellationToken cancellationToken = default)
    {
        var query = _context.Tags.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(t => EF.Functions.Like(t.Name, $"%{searchTerm}%"));
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Tag?> GetByIdAsync(long tagId, CancellationToken cancellationToken = default)
    {
        return await _context.Tags
            .FirstOrDefaultAsync(t => t.Id == tagId, cancellationToken);
    }

    public async Task<Tag?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Tags
            .FirstOrDefaultAsync(t => t.Name == name, cancellationToken);
    }

    public async Task AddAsync(Tag tag, CancellationToken cancellationToken = default)
    {
        await _context.Tags.AddAsync(tag, cancellationToken);
    }

    public async Task UpdateAsync(Tag tag, CancellationToken cancellationToken = default)
    {
        _context.Tags.Update(tag);
    }

    private IQueryable<Tag> ApplyOrdering(IQueryable<Tag> query, string? orderBy, string orderDir)
    {
        if (string.IsNullOrWhiteSpace(orderBy))
            return query.OrderBy(t => t.Name);

        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        return orderBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "createdat" => descending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            "isactive" => descending ? query.OrderByDescending(t => t.IsActive) : query.OrderBy(t => t.IsActive),
            _ => query.OrderBy(t => t.Name)
        };
    }
}