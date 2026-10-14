using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Application.Constants;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class UserRepository(ApplicationDbContext context) : IUserRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Add(user);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByEmailAndValidationTokenHashAsync(string email, string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.EmailValidationToken == tokenHash, cancellationToken);
    }

    public async Task<User?> GetByIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetPagedAsync(GetUsersRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.search))
        {
            var search = request.search;
            query = query.Where(u => u.LastName.Contains(search) || u.Email.Contains(search));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        var now = DateTime.UtcNow;

        if (request.IsBanned.HasValue)
        {
            query = request.IsBanned.Value
                ? query.Where(u => _context.Bans.Any(b => b.User.Id == u.Id && b.IsActive && b.StartDate <= now && (b.EndDate == null || b.EndDate > now)))
                : query.Where(u => !_context.Bans.Any(b => b.User.Id == u.Id && b.IsActive && b.StartDate <= now && (b.EndDate == null || b.EndDate > now)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var descending = string.Equals(request.orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        query = request.orderBy switch
        {
            "LastName" => descending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
            "Email" => descending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "IsActive" => descending ? query.OrderByDescending(u => u.IsActive) : query.OrderBy(u => u.IsActive),
            "IsBanned" => descending ? query.OrderByDescending(u => _context.Bans.Any(b => b.User.Id == u.Id && b.IsActive && b.StartDate <= now && (b.EndDate == null || b.EndDate > now))) : query.OrderBy(u => _context.Bans.Any(b => b.User.Id == u.Id && b.IsActive && b.StartDate <= now && (b.EndDate == null || b.EndDate > now))),
            "BanCount" => descending ? query.OrderByDescending(u => _context.Bans.Count(b => b.User.Id == u.Id && b.IsActive)) : query.OrderBy(u => _context.Bans.Count(b => b.User.Id == u.Id && b.IsActive)),
            "CreatedAt" => descending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        query = query.Include(u => u.Nationality).Include(u => u.Avatar);

        List<User> users = await query
            .Skip((request.currentPage - 1) * request.pageSize)
            .Take(request.pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalCount);
    }

    public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetActiveForBanSelectionAsync(GetUsersForBanSelectionRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();

        query = query.Where(u => u.IsActive);

        var now = DateTime.UtcNow;
        query = query.Where(u => !_context.Bans.Any(b => b.User.Id == u.Id && b.IsActive && b.StartDate <= now && (b.EndDate == null || b.EndDate > now)));

        if (!string.IsNullOrWhiteSpace(request.search))
        {
            var search = request.search;
            query = query.Where(u => u.FirstName.Contains(search) ||
                                     u.LastName.Contains(search) ||
                                     u.Email.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var descending = string.Equals(request.orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        query = request.orderBy?.ToLower() switch
        {
            "firstname" => descending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
            "lastname" => descending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
            "email" => descending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            _ => descending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt)
        };

        query = query.Include(u => u.Nationality).Include(u => u.Avatar);

        var users = await query
            .Skip((request.currentPage - 1) * request.pageSize)
            .Take(request.pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalCount);
    }

    public async Task<(IReadOnlyList<User> Items, int TotalCount)> GetAdminUsersPagedAsync(GetAdminUsersRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.AsNoTracking().AsQueryable();

        query = query.Where(u => u.Role == Domain.Enums.UserRole.Administrator);

        if (!string.IsNullOrWhiteSpace(request.search))
        {
            var search = request.search;
            query = query.Where(u => u.FirstName.Contains(search) ||
                                     u.LastName.Contains(search) ||
                                     u.Email.Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var descending = string.Equals(request.orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        query = request.orderBy?.ToLower() switch
        {
            "firstname" => descending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
            "lastname" => descending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
            "email" => descending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "createdat" => descending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
            _ => descending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt)
        };

        query = query.Include(u => u.Nationality).Include(u => u.Avatar);

        var users = await query
            .Skip((request.currentPage - 1) * request.pageSize)
            .Take(request.pageSize)
            .ToListAsync(cancellationToken);

        return (users, totalCount);
    }

    public async Task<int> GetActiveAdminUsersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .CountAsync(u => u.Role == Domain.Enums.UserRole.Administrator && u.IsActive, cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
    }
}
