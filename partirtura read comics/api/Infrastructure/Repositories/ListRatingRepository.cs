using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ListRatingRepository(ApplicationDbContext context) : IListRatingRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<ListRating?> GetByUserIdAndWorkListIdAsync(long userId, long workListId, CancellationToken cancellationToken = default)
    {
        return await _context.ListRatings
            .FirstOrDefaultAsync(rating =>
                rating.User != null && rating.User.Id == userId &&
                rating.WorkList != null && rating.WorkList.Id == workListId, cancellationToken);
    }

    public async Task AddAsync(ListRating rating, CancellationToken cancellationToken = default)
    {
        await _context.ListRatings.AddAsync(rating, cancellationToken);
    }

    public Task UpdateAsync(ListRating rating, CancellationToken cancellationToken = default)
    {
        _context.ListRatings.Update(rating);
        return Task.CompletedTask;
    }

    public void Detach(ListRating rating)
    {
        _context.Entry(rating).State = EntityState.Detached;
    }

    public async Task ApplyNewVoteToWorkListAccumulatorsAsync(long workListId, int stars, CancellationToken cancellationToken = default)
    {
        var affectedRows = await _context.Database.ExecuteSqlRawAsync(
            "UPDATE `WorkLists` SET `AverageRating` = (`RatingCount` * `AverageRating` + {0}) / (`RatingCount` + 1), `RatingCount` = `RatingCount` + 1 WHERE `Id` = {1}",
            new object[] { stars, workListId },
            cancellationToken);

        if (affectedRows == 0)
        {
            throw new Domain.Exceptions.BusinessNotFoundException("The work list no longer exists.");
        }
    }

    public async Task ApplyScoreChangeToWorkListAccumulatorsAsync(long workListId, int previousStars, int newStars, CancellationToken cancellationToken = default)
    {
        var affectedRows = await _context.Database.ExecuteSqlRawAsync(
            "UPDATE `WorkLists` SET `AverageRating` = (`RatingCount` * `AverageRating` - {0} + {1}) / `RatingCount` WHERE `Id` = {2} AND `RatingCount` > 0",
            new object[] { previousStars, newStars, workListId },
            cancellationToken);

        if (affectedRows == 0)
        {
            affectedRows = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE `WorkLists` SET `AverageRating` = {0}, `RatingCount` = 1 WHERE `Id` = {1} AND `RatingCount` = 0",
                new object[] { (double)newStars, workListId },
                cancellationToken);
        }

        if (affectedRows == 0)
        {
            throw new Domain.Exceptions.BusinessNotFoundException("The work list no longer exists.");
        }
    }

    public async Task ApplyReactivationToWorkListAccumulatorsAsync(long workListId, int stars, CancellationToken cancellationToken = default)
    {
        var affectedRows = await _context.Database.ExecuteSqlRawAsync(
            "UPDATE `WorkLists` SET `AverageRating` = (`RatingCount` * `AverageRating` + {0}) / (`RatingCount` + 1), `RatingCount` = `RatingCount` + 1 WHERE `Id` = {1}",
            new object[] { stars, workListId },
            cancellationToken);

        if (affectedRows == 0)
        {
            throw new Domain.Exceptions.BusinessNotFoundException("The work list no longer exists.");
        }
    }
}
