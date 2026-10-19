using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Tests.Integration;

internal static class FavoriteTestSupport
{
    public static async Task<IReadOnlyList<long>> CreateWorksAsync(IntegrationTestFixture fixture, int count)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var workType = await dbContext.WorkTypes.FirstAsync();
        var language = await dbContext.Languages.FirstAsync();
        var unique = Guid.NewGuid().ToString("N");

        var workIds = new List<long>();

        for (var index = 0; index < count; index++)
        {
            var work = new Work
            {
                Title = $"US-0035 favorite work {unique} {index}",
                WorkType = workType,
                Language = language,
                IsActive = true,
                ContentStatus = ContentStatus.Missing,
                CreatedAt = DateTime.UtcNow
            };

            await unitOfWork.WorkRepository.AddAsync(work, default);
            await unitOfWork.SaveChangesAsync(default);
            workIds.Add(work.Id);
        }

        return workIds;
    }

    public static async Task ClearFavoritesAsync(IntegrationTestFixture fixture, long userId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var rows = await dbContext.Favorites
            .Where(favorite => favorite.User != null && favorite.User.Id == userId)
            .ToListAsync();

        if (rows.Count == 0)
        {
            return;
        }

        dbContext.Favorites.RemoveRange(rows);
        await dbContext.SaveChangesAsync();
    }

    public static async Task<IReadOnlyList<long>> GetFavoriteWorkIdsAsync(IntegrationTestFixture fixture, long userId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.Favorites
            .AsNoTracking()
            .Where(favorite => favorite.User != null && favorite.User.Id == userId)
            .Select(favorite => favorite.Work.Id)
            .ToListAsync();
    }

    public static async Task<int> CountFavoritesAsync(IntegrationTestFixture fixture, long userId, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.Favorites
            .AsNoTracking()
            .CountAsync(favorite => favorite.User != null && favorite.User.Id == userId && favorite.Work != null && favorite.Work.Id == workId);
    }

    public static async Task CleanupAsync(IntegrationTestFixture fixture, long userId, IReadOnlyCollection<long> workIds)
    {
        var ids = workIds.ToList();

        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var favoriteRows = await dbContext.Favorites
            .Where(favorite => (favorite.User != null && favorite.User.Id == userId)
                               || (favorite.Work != null && ids.Contains(favorite.Work.Id)))
            .ToListAsync();
        dbContext.Favorites.RemoveRange(favoriteRows);

        if (ids.Count > 0)
        {
            var progressRows = await dbContext.WorkReadingProgresses
                .Where(progress => progress.Work != null && ids.Contains(progress.Work.Id))
                .ToListAsync();
            dbContext.WorkReadingProgresses.RemoveRange(progressRows);

            var ratingRows = await dbContext.WorkRatings
                .Where(rating => rating.Work != null && ids.Contains(rating.Work.Id))
                .ToListAsync();
            dbContext.WorkRatings.RemoveRange(ratingRows);

            var works = await dbContext.Works.Where(work => ids.Contains(work.Id)).ToListAsync();
            dbContext.Works.RemoveRange(works);
        }

        await dbContext.SaveChangesAsync();
    }
}
