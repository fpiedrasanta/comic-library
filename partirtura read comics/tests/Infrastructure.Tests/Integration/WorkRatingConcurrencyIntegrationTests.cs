using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkRatingConcurrencyIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public WorkRatingConcurrencyIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateOrUpdate_ConcurrentVotesOfDifferentUsers_DoNotLoseAccumulatorUpdates()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);
        var scores = new[] { 5, 4, 3, 2, 0 };
        var ratingIds = new System.Collections.Concurrent.ConcurrentBag<long>();

        var votes = users
            .Select((user, index) => Task.Run(async () =>
            {
                using var scope = _fixture.ScopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

                var result = await service.CreateOrUpdateAsync(workId, user.Id, scores[index], $"concurrent {index}", default);
                ratingIds.Add(result.Id);
            }))
            .ToArray();

        await Task.WhenAll(votes);

        try
        {
            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);

            Assert.Equal(5, ratingCount);
            Assert.Equal(2.8, averageRating, 6);

            var listing = await GetListingCountAsync(workId);
            Assert.Equal(5, listing);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds.ToList());
        }
    }

    [Fact]
    public async Task CreateOrUpdate_ConcurrentFirstVotesOfSameUser_CreateASingleRating()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new System.Collections.Concurrent.ConcurrentBag<long>();

        var votes = Enumerable
            .Range(0, 5)
            .Select(_ => Task.Run(async () =>
            {
                using var scope = _fixture.ScopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

                var result = await service.CreateOrUpdateAsync(workId, user.Id, 4, "concurrent first vote", default);
                ratingIds.Add(result.Id);
            }))
            .ToArray();

        await Task.WhenAll(votes);

        try
        {
            var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
            Assert.NotNull(persisted);
            Assert.Equal(4, persisted!.Stars);

            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, ratingCount);
            Assert.Equal(4.0, averageRating, 6);

            var listing = await GetListingCountAsync(workId);
            Assert.Equal(1, listing);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds.ToList());
        }
    }

    [Fact]
    public async Task CreateOrUpdate_ConcurrentVotesAndEdits_KeepAccumulatorsConsistentWithActiveRatings()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 3);
        var ratingIds = new System.Collections.Concurrent.ConcurrentBag<long>();

        var operations = new List<Task>();

        operations.Add(Task.Run(async () =>
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[0].Id, 5, null, default)).Id);
        }));

        operations.Add(Task.Run(async () =>
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[1].Id, 1, null, default)).Id);
        }));

        operations.Add(Task.Run(async () =>
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
            ratingIds.Add((await service.CreateOrUpdateAsync(workId, users[2].Id, 0, null, default)).Id);
        }));

        await Task.WhenAll(operations);

        try
        {
            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);

            Assert.Equal(3, ratingCount);
            Assert.Equal(2.0, averageRating, 6);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds.ToList());
        }
    }

    private async Task<int> GetListingCountAsync(long workId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        var listing = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50 }, default);

        return listing.TotalCount;
    }
}
