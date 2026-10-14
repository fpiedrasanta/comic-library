using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

internal static class WorkRatingTestSupport
{
    public static async Task<IReadOnlyList<long>> PickActiveWorkIdsWithoutRatingsAsync(IntegrationTestFixture fixture, int count)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 50 }, null, default);
        var selected = new List<long>();

        foreach (var item in catalog.Items)
        {
            if (await HasRatingRowsAsync(fixture, item.Id))
            {
                continue;
            }

            selected.Add(item.Id);

            if (selected.Count == count)
            {
                break;
            }
        }

        if (selected.Count < count)
        {
            throw new InvalidOperationException($"The development database does not have {count} active works without rating rows to run the WorkRating tests.");
        }

        return selected;
    }

    public static async Task<IReadOnlyList<User>> PickActiveUsersAsync(IntegrationTestFixture fixture, int count)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var (users, _) = await unitOfWork.UserRepository.GetPagedAsync(
            new GetUsersRequest { currentPage = 1, pageSize = 50, IsActive = true, orderBy = "CreatedAt", orderDir = Application.Constants.SortDirection.ASC },
            default);

        var selected = users.Take(count).ToList();

        if (selected.Count < count)
        {
            throw new InvalidOperationException($"The development database does not have {count} active users to run the WorkRating tests.");
        }

        return selected;
    }

    public static async Task<(int RatingCount, double AverageRating)> ReadAccumulatorsAsync(IntegrationTestFixture fixture, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);

        if (work is null)
        {
            throw new InvalidOperationException($"Work {workId} no longer exists in the development database.");
        }

        return (work.RatingCount, work.AverageRating);
    }

    public static async Task CleanupRatingsAsync(IntegrationTestFixture fixture, long workId, IReadOnlyCollection<long> ratingIds)
    {
        await RemoveRatingRowsAsync(fixture, ratingIds);
        await RestoreAccumulatorsAsync(fixture, workId, 0, 0);
    }

    public static async Task SetWorkActiveAsync(IntegrationTestFixture fixture, long workId, bool isActive)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);

        if (work is null)
        {
            return;
        }

        work.IsActive = isActive;
        await unitOfWork.SaveChangesAsync(default);
    }

    public static async Task<WorkRating?> GetRatingAsync(IntegrationTestFixture fixture, long userId, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        return await unitOfWork.WorkRatingRepository.GetByUserIdAndWorkIdAsync(userId, workId, default);
    }

    private static async Task<bool> HasRatingRowsAsync(IntegrationTestFixture fixture, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.WorkRatings
            .AsNoTracking()
            .AnyAsync(rating => rating.Work != null && rating.Work.Id == workId, default);
    }

    private static async Task RemoveRatingRowsAsync(IntegrationTestFixture fixture, IReadOnlyCollection<long> ratingIds)
    {
        if (ratingIds.Count == 0)
        {
            return;
        }

        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var ratings = await dbContext.WorkRatings
            .Where(rating => ratingIds.Contains(rating.Id))
            .ToListAsync(default);

        if (ratings.Count == 0)
        {
            return;
        }

        dbContext.WorkRatings.RemoveRange(ratings);
        await dbContext.SaveChangesAsync(default);
    }

    private static async Task RestoreAccumulatorsAsync(IntegrationTestFixture fixture, long workId, int ratingCount, double averageRating)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);

        if (work is null)
        {
            return;
        }

        work.RatingCount = ratingCount;
        work.AverageRating = averageRating;
        await unitOfWork.SaveChangesAsync(default);
    }
}
