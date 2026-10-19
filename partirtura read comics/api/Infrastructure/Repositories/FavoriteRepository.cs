using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces;

namespace Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly ApplicationDbContext _context;

    public FavoriteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsAsync(long userId, long workId, CancellationToken cancellationToken)
    {
        return await _context.Favorites
            .AsNoTracking()
            .AnyAsync(f => f.User.Id == userId && f.Work.Id == workId, cancellationToken);
    }

    public async Task<IReadOnlyList<long>> GetFavoriteWorkIdsAsync(long userId, IReadOnlyCollection<long> workIds, CancellationToken cancellationToken)
    {
        if (workIds.Count == 0)
        {
            return Array.Empty<long>();
        }

        return await _context.Favorites
            .AsNoTracking()
            .Where(f => f.User.Id == userId && workIds.Contains(f.Work.Id))
            .Select(f => f.Work.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<Favorite?> GetAsync(long userId, long workId, CancellationToken cancellationToken)
    {
        return await _context.Favorites
            .Include(f => f.User)
            .Include(f => f.Work)
            .FirstOrDefaultAsync(f => f.User.Id == userId && f.Work.Id == workId, cancellationToken);
    }

    public async Task AddAsync(Favorite favorite, CancellationToken cancellationToken)
    {
        await _context.Favorites.AddAsync(favorite, cancellationToken);
    }

    public Task RemoveAsync(Favorite favorite, CancellationToken cancellationToken)
    {
        _context.Favorites.Remove(favorite);
        return Task.CompletedTask;
    }
}
