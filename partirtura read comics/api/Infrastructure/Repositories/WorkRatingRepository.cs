using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WorkRatingRepository(ApplicationDbContext context) : IWorkRatingRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<WorkRating?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.WorkRatings
            .FirstOrDefaultAsync(wr => wr.Id == id, cancellationToken);
    }

    public async Task<WorkRating?> GetByUserIdAndWorkIdAsync(long userId, long workId, CancellationToken cancellationToken = default)
    {
        return await _context.WorkRatings
            .Where(wr => wr.User != null && wr.User.Id == userId && wr.Work != null && wr.Work.Id == workId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Dictionary<long, WorkRating>> GetByUserIdAndWorkIdsAsync(long userId, IEnumerable<long> workIds, CancellationToken cancellationToken = default)
    {
        var requestedWorkIds = workIds.ToList();

        if (requestedWorkIds.Count == 0)
        {
            return new Dictionary<long, WorkRating>();
        }

        return await _context.WorkRatings
            .AsNoTracking()
            .Where(wr => wr.User != null && wr.User.Id == userId && wr.Work != null && requestedWorkIds.Contains(wr.Work.Id))
            .ToDictionaryAsync(rating => rating.Work!.Id, cancellationToken);
    }

    public async Task<(IReadOnlyList<WorkRating> Items, int TotalCount)> GetPagedByWorkIdAsync(long workId, int currentPage, int pageSize, string? orderBy, string orderDir, CancellationToken cancellationToken = default)
    {
        var query = _context.WorkRatings
            .AsNoTracking()
            .Where(wr => wr.Work != null && wr.Work.Id == workId && wr.IsActive);

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        var items = await query
            .Include(wr => wr.User)
            .ThenInclude(user => user!.Avatar)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(WorkRating rating, CancellationToken cancellationToken = default)
    {
        await _context.WorkRatings.AddAsync(rating, cancellationToken);
    }

    public async Task UpdateAsync(WorkRating rating, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
        _context.WorkRatings.Update(rating);
    }

    public void Detach(WorkRating rating)
    {
        _context.Entry(rating).State = EntityState.Detached;
    }

    public async Task ApplyNewVoteToWorkAccumulatorsAsync(long workId, int stars, CancellationToken cancellationToken = default)
    {
        // MySQL evaluates SET assignments left to right, so AverageRating must be assigned before
        // RatingCount: both expressions have to read the values stored before this statement.
        var affectedRows = await _context.Database.ExecuteSqlRawAsync(
            "UPDATE `Works` SET `AverageRating` = (`RatingCount` * `AverageRating` + {0}) / (`RatingCount` + 1), `RatingCount` = `RatingCount` + 1 WHERE `Id` = {1}",
            new object[] { stars, workId },
            cancellationToken);

        if (affectedRows == 0)
        {
            throw new Domain.Exceptions.BusinessNotFoundException("The work no longer exists.");
        }
    }

    public async Task ApplyScoreChangeToWorkAccumulatorsAsync(long workId, int previousStars, int newStars, CancellationToken cancellationToken = default)
    {
        var affectedRows = await _context.Database.ExecuteSqlRawAsync(
            "UPDATE `Works` SET `AverageRating` = (`RatingCount` * `AverageRating` - {0} + {1}) / `RatingCount` WHERE `Id` = {2} AND `RatingCount` > 0",
            new object[] { previousStars, newStars, workId },
            cancellationToken);

        if (affectedRows == 0)
        {
            affectedRows = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE `Works` SET `AverageRating` = {0}, `RatingCount` = 1 WHERE `Id` = {1} AND `RatingCount` = 0",
                new object[] { (double)newStars, workId },
                cancellationToken);
        }

        if (affectedRows == 0)
        {
            throw new Domain.Exceptions.BusinessNotFoundException("The work no longer exists.");
        }
    }

    private static IQueryable<WorkRating> ApplyOrdering(IQueryable<WorkRating> query, string? orderBy, string orderDir)
    {
        var descending = orderDir.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase);
        var ordersByStars = string.Equals(orderBy?.Trim(), WorkRatingSortFields.Stars, StringComparison.OrdinalIgnoreCase);

        var ordered = ordersByStars
            ? (descending ? query.OrderByDescending(wr => wr.Stars) : query.OrderBy(wr => wr.Stars))
            : (descending ? query.OrderByDescending(wr => wr.CreatedAt) : query.OrderBy(wr => wr.CreatedAt));

        return ordered.ThenBy(wr => wr.Id);
    }
}
