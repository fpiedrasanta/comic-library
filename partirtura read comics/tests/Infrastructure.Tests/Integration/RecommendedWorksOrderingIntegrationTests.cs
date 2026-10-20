using Application.Constants;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class RecommendedWorksOrderingIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public RecommendedWorksOrderingIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task MostRated_OrdersTheWorksByTheRatingTheCardDisplays()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 2);

        try
        {
            // The rated work exposes 5 stars in its card (the persisted accumulators), the other one exposes none.
            await WorkRatingTestSupport.SetAccumulatorsAsync(_fixture, workIds[0], 1, 5);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommendedService = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var recommended = (await recommendedService.GetRecommendedAsync(user.Id, RecommendedSortFields.MostRated, default)).ToList();

            var ratedIndex = recommended.FindIndex(work => work.Id == workIds[0]);
            var unratedIndex = recommended.FindIndex(work => work.Id == workIds[1]);

            Assert.True(ratedIndex >= 0, "The rated work must be part of the recommended works.");
            Assert.Equal(5, recommended[ratedIndex].AverageRating);
            Assert.True(unratedIndex < 0 || ratedIndex < unratedIndex, "The work with the best rating must come first.");
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task MostRated_KeepsTheWorksWithoutRatingAtTheEnd()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommendedService = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var recommended = (await recommendedService.GetRecommendedAsync(user.Id, RecommendedSortFields.MostRated, default)).ToList();

            var unratedIndex = recommended.FindIndex(work => work.Id == workIds[0]);

            Assert.True(unratedIndex < 0 || recommended[unratedIndex].AverageRating is null or 0);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task RecentlyAdded_OrdersTheWorksByCreationDate()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 2);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommendedService = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var recommended = (await recommendedService.GetRecommendedAsync(user.Id, RecommendedSortFields.RecentlyAdded, default)).ToList();

            var firstIndex = recommended.FindIndex(work => work.Id == workIds[0]);
            var secondIndex = recommended.FindIndex(work => work.Id == workIds[1]);

            Assert.True(firstIndex >= 0);
            Assert.True(secondIndex >= 0);
            Assert.True(secondIndex < firstIndex, "The newest work must come first.");
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }
}
