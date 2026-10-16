using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkCardAverageRatingIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public WorkCardAverageRatingIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Catalog_ExposesAverageRatingPerWork()
    {
        var (ratedWorkId, zeroStarWorkId, unratedWorkId, createdUserIds) = await CreateWorkRatingScenarioAsync();

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var ratedAccum = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, ratedWorkId);
            Assert.Equal((2, 4.5), (ratedAccum.RatingCount, ratedAccum.AverageRating));

            var page = await CollectCatalogAsync(works, createdUserIds[0]);

            var rated = page.Single(item => item.Id == ratedWorkId);
            var zeroStar = page.Single(item => item.Id == zeroStarWorkId);
            var unrated = page.Single(item => item.Id == unratedWorkId);

            Assert.Equal(4.5, rated.AverageRating);
            Assert.Equal(0.0, zeroStar.AverageRating);
            Assert.Null(unrated.AverageRating);

            Assert.Empty(dbContext.ChangeTracker.Entries<Domain.Entities.Work>());
        }
        finally
        {
            await CleanUpCreatedWorksAsync(ratedWorkId, zeroStarWorkId, unratedWorkId);
        }
    }

    [Fact]
    public async Task Recommended_ExposesAverageRatingPerWork()
    {
        var (ratedWorkId, zeroStarWorkId, unratedWorkId, createdUserIds) = await CreateWorkRatingScenarioAsync();

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var rated = await recommended.GetRecommendedAsync(createdUserIds[0], "MostRated", default);

            var ratedItem = rated.Single(item => item.Id == ratedWorkId);
            Assert.Equal(4.5, ratedItem.AverageRating);

            Assert.Contains(rated, item => item.Id == zeroStarWorkId && item.AverageRating == 0);
            Assert.Contains(rated, item => item.AverageRating is null);
        }
        finally
        {
            await CleanUpCreatedWorksAsync(ratedWorkId, zeroStarWorkId, unratedWorkId);
        }
    }

    [Fact]
    public async Task History_ExposesAverageRatingPerWork()
    {
        var (ratedWorkId, zeroStarWorkId, unratedWorkId, createdUserIds) = await CreateWorkRatingScenarioAsync();

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

            var page = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, createdUserIds[0], default);

            Assert.NotEmpty(page.Items);
        }
        finally
        {
            await CleanUpCreatedWorksAsync(ratedWorkId, zeroStarWorkId, unratedWorkId);
        }
    }

    private async Task<(long ratedWorkId, long zeroStarWorkId, long unratedWorkId, long[] createdUserIds)> CreateWorkRatingScenarioAsync()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 4);
        var createdUserIds = users.Select(user => user.Id).ToArray();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var workRatingService = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var workType = await dbContext.WorkTypes.FirstAsync();
        var language = await dbContext.Languages.FirstAsync();

        var ratedWork = new Work
        {
            Title = $"Avg rating rated work {Guid.NewGuid():N}",
            WorkType = workType,
            Language = language,
            IsActive = true,
            ContentStatus = ContentStatus.Missing,
            CreatedAt = DateTime.UtcNow
        };
        var zeroStarWork = new Work
        {
            Title = $"Avg rating zero-star work {Guid.NewGuid():N}",
            WorkType = workType,
            Language = language,
            IsActive = true,
            ContentStatus = ContentStatus.Missing,
            CreatedAt = DateTime.UtcNow
        };
        var unratedWork = new Work
        {
            Title = $"Avg rating unrated work {Guid.NewGuid():N}",
            WorkType = workType,
            Language = language,
            IsActive = true,
            ContentStatus = ContentStatus.Missing,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.WorkRepository.AddAsync(ratedWork, default);
        await unitOfWork.WorkRepository.AddAsync(zeroStarWork, default);
        await unitOfWork.WorkRepository.AddAsync(unratedWork, default);
        await unitOfWork.SaveChangesAsync(default);

        await workRatingService.CreateOrUpdateAsync(ratedWork.Id, createdUserIds[1], 5, null, default);
        await workRatingService.CreateOrUpdateAsync(ratedWork.Id, createdUserIds[2], 4, null, default);

        await workRatingService.CreateOrUpdateAsync(zeroStarWork.Id, createdUserIds[1], 0, null, default);

        return (ratedWork.Id, zeroStarWork.Id, unratedWork.Id, createdUserIds);
    }

    private async Task CleanUpCreatedWorksAsync(params long[] workIds)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var progresses = await dbContext.WorkReadingProgresses
            .Where(progress => progress.Work != null && workIds.Contains(progress.Work.Id))
            .ToListAsync();
        dbContext.WorkReadingProgresses.RemoveRange(progresses);

        var ratings = await dbContext.WorkRatings
            .Where(rating => rating.Work != null && workIds.Contains(rating.Work.Id))
            .ToListAsync();
        dbContext.WorkRatings.RemoveRange(ratings);

        var works = await dbContext.Works.Where(work => workIds.Contains(work.Id)).ToListAsync();
        dbContext.Works.RemoveRange(works);

        await dbContext.SaveChangesAsync();
    }

    private static async Task<List<WorkCatalogItemDto>> CollectCatalogAsync(IWorkService works, long userId)
    {
        var items = new List<WorkCatalogItemDto>();
        var currentPage = 1;

        while (true)
        {
            var page = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = currentPage, pageSize = 50 }, userId, default);

            items.AddRange(page.Items);

            if (!page.HasNextPage)
            {
                break;
            }

            currentPage++;
        }

        return items;
    }
}
