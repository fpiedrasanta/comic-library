using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Application.Constants;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class BanRepository : IBanRepository
{
    private readonly ApplicationDbContext _context;

    public BanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Ban ban, CancellationToken cancellationToken = default)
    {
        await _context.Bans.AddAsync(ban, cancellationToken);
    }

    public async Task<Ban?> GetByIdAsync(long banId, CancellationToken cancellationToken = default)
    {
        return await _context.Bans
            .FirstOrDefaultAsync(b => b.Id == banId, cancellationToken);
    }

    public async Task<IReadOnlyList<Ban>> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.Bans
            .Where(b => b.User.Id == userId &&
                        b.IsActive &&
                        b.StartDate <= now &&
                        (b.EndDate == null || b.EndDate > now))
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Ban> Items, int TotalCount)> GetPagedAsync(GetBansRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.Bans.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search;
            query = query.Where(b => b.User.FirstName.Contains(search) ||
                                     b.User.LastName.Contains(search) ||
                                     b.User.Email.Contains(search));
        }

        if (request.StartDate.HasValue)
        {
            var start = request.StartDate.Value;
            query = query.Where(b => b.StartDate >= start);
        }

        if (request.EndDate.HasValue)
        {
            var end = request.EndDate.Value;
            query = query.Where(b => b.EndDate <= end);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(b => b.IsActive == request.IsActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, request.orderBy, request.orderDir);

        var items = await query
            .Include(b => b.User)
            .Skip((request.currentPage - 1) * request.pageSize)
            .Take(request.pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private static string GetBanStatus(bool isActive, DateTime startDate, DateTime? endDate, DateTime now)
    {
        if (!isActive) return "Revoked";
        if (startDate <= now && (endDate == null || endDate > now)) return "Active";
        return "Finished";
    }

    private static IQueryable<Ban> ApplyOrdering(IQueryable<Ban> query, string? orderBy, string orderDir)
    {
        var descending = string.Equals(orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        return orderBy?.ToLower() switch
        {
            "firstname" => descending ? query.OrderByDescending(b => b.User.FirstName) : query.OrderBy(b => b.User.FirstName),
            "lastname" => descending ? query.OrderByDescending(b => b.User.LastName) : query.OrderBy(b => b.User.LastName),
            "email" => descending ? query.OrderByDescending(b => b.User.Email) : query.OrderBy(b => b.User.Email),
            "startdate" => descending ? query.OrderByDescending(b => b.StartDate) : query.OrderBy(b => b.StartDate),
            "enddate" => descending ? query.OrderByDescending(b => b.EndDate) : query.OrderBy(b => b.EndDate),
            _ => query.OrderByDescending(b => b.CreatedAt)
        };
    }
}
