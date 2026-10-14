using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkCardAverageRatingIntegrationTests
{
    // Controlled dataset seeded in the development database (see the execution result of TASK-API-0299).
    private const string QueryingUserEmail = "rec.user6@comiclibrary.test";

    private const long RatedWorkId = 17;   // active ratings of 5 and 4 stars, average 4.5
    private const long ZeroStarWorkId = 10; // active rating of 0 stars, average 0
    private const long UnratedWorkId = 12;  // no ratings
    private const long ReadWorkId = 2;      // no ratings, has reading progress of other users

    private readonly IntegrationTestFixture _fixture;

    public WorkCardAverageRatingIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Catalog_ExposesAverageRatingPerWork()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var page = await CollectCatalogAsync(works, user.Id);

        var rated = page.Single(item => item.Id == RatedWorkId);
        var zeroStar = page.Single(item => item.Id == ZeroStarWorkId);
        var unrated = page.Single(item => item.Id == UnratedWorkId);

        Assert.Equal(4.5, rated.AverageRating);
        Assert.Equal(0.0, zeroStar.AverageRating);
        Assert.Null(unrated.AverageRating);

        Assert.Empty(dbContext.ChangeTracker.Entries<Domain.Entities.Work>());
    }

    [Fact]
    public async Task Recommended_ExposesAverageRatingPerWork()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        var rated = await recommended.GetRecommendedAsync(user.Id, "MostRated", default);
        var popular = await recommended.GetRecommendedAsync(user.Id, "MostPopular", default);

        var ratedItem = rated.Single(item => item.Id == RatedWorkId);
        Assert.Equal(4.5, ratedItem.AverageRating);

        Assert.Contains(rated, item => item.Id == ZeroStarWorkId && item.AverageRating == 0);
        Assert.Contains(rated, item => item.AverageRating is null);
    }

    [Fact]
    public async Task History_ExposesAverageRatingPerWork()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        var page = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, user.Id, default);

        Assert.NotEmpty(page.Items);
    }

    [Fact]
    public async Task AverageRating_MatchesActiveRatingsStoredInDatabase()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var page = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 50 }, user.Id, default);
        var pageIds = page.Items.Select(item => item.Id).ToList();

        var ratings = await dbContext.WorkRatings
            .AsNoTracking()
            .Where(rating => rating.Work != null && pageIds.Contains(rating.Work.Id) && rating.IsActive)
            .Select(rating => new { WorkId = rating.Work!.Id, rating.Stars })
            .ToListAsync(default);

        var averages = ratings
            .GroupBy(rating => rating.WorkId)
            .ToDictionary(group => group.Key, group => group.Average(rating => (double)rating.Stars));

        foreach (var item in page.Items)
        {
            var expected = averages.TryGetValue(item.Id, out var average) ? average : (double?)null;

            Assert.Equal(expected, item.AverageRating);
        }
    }

    private static async Task<List<WorkCatalogItemDto>> CollectCatalogAsync(IWorkService works, long? userId)
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

    private async Task<Domain.Entities.User> FindUserByEmailAsync(string email)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var (users, _) = await unitOfWork.UserRepository.GetPagedAsync(
            new GetUsersRequest { currentPage = 1, pageSize = 50, IsActive = true, orderBy = "CreatedAt", orderDir = Application.Constants.SortDirection.ASC },
            default);

        var user = users.FirstOrDefault(candidate => string.Equals(candidate.Email, email, StringComparison.OrdinalIgnoreCase));

        if (user is null)
        {
            throw new InvalidOperationException($"The controlled dataset user {email} does not exist in the development database.");
        }

        return user;
    }
}
