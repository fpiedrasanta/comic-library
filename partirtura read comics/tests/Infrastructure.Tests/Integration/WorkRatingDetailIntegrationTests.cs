using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkRatingDetailIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public WorkRatingDetailIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetCatalogById_WorkWithVotes_ReturnsAverageAndCountFromAccumulators()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 3);
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        try
        {
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[0].Id, 5, "Excellent", default)).Id);
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[1].Id, 4, "Very good", default)).Id);
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[2].Id, 0, null, default)).Id);

            var detail = await works.GetCatalogByIdAsync(workId, null, default);

            Assert.Equal(3, detail.RatingCount);
            Assert.Equal(3.0, detail.AverageRating, 6);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task GetCatalogById_WorkWithoutVotes_ReturnsZeroAverageAndZeroCount()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var detail = await works.GetCatalogByIdAsync(workId, null, default);

        Assert.Equal(0, detail.RatingCount);
        Assert.Equal(0.0, detail.AverageRating, 6);
    }

    [Fact]
    public async Task GetReaderPages_WithVote_ReturnsMyRatingWithStarsAndReview()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        try
        {
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[0].Id, 4, "Finished it", default)).Id);

            var reader = await works.GetReaderPagesAsync(workId, users[0].Id, default);

            Assert.NotNull(reader.MyRating);
            Assert.Equal(4, reader.MyRating!.Stars);
            Assert.Equal("Finished it", reader.MyRating.Review);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task GetReaderPages_UserWithoutVote_ReturnsNullMyRating()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        try
        {
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[0].Id, 4, null, default)).Id);

            var reader = await works.GetReaderPagesAsync(workId, users[1].Id, default);

            Assert.Null(reader.MyRating);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task GetReaderPages_AnonymousUser_ReturnsNullMyRating()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        try
        {
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[0].Id, 2, "Mine", default)).Id);

            var reader = await works.GetReaderPagesAsync(workId, null, default);

            Assert.Null(reader.MyRating);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }
}
