using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkRatingServiceIntegrationTests
{
    private const long UnknownId = 9_999_999_999;
    private readonly IntegrationTestFixture _fixture;

    public WorkRatingServiceIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateOrUpdate_FirstVote_IncrementsRatingCountAndSetsAverage()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var result = await service.CreateOrUpdateAsync(workId, user.Id, 4, "Great work", default);
            ratingIds.Add(result.Id);

            Assert.Equal(4, result.Stars);
            Assert.Equal("Great work", result.Review);
            Assert.Equal(workId, result.WorkId);
            Assert.Null(result.UpdatedAt);

            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, ratingCount);
            Assert.Equal(4.0, averageRating, 6);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_ZeroStars_IsAValidVoteCountedInAccumulators()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var result = await service.CreateOrUpdateAsync(workId, user.Id, 0, null, default);
            ratingIds.Add(result.Id);

            Assert.Equal(0, result.Stars);
            Assert.Null(result.Review);

            var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
            Assert.NotNull(persisted);
            Assert.Equal(0, persisted!.Stars);

            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, ratingCount);
            Assert.Equal(0.0, averageRating, 6);

            var listing = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50 }, default);
            Assert.Contains(listing.Items, item => item.UserId == user.Id && item.Stars == 0);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_NullStars_IsNormalizedToZero()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var result = await service.CreateOrUpdateAsync(workId, user.Id, null, "Only a review", default);
            ratingIds.Add(result.Id);

            Assert.Equal(0, result.Stars);

            var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
            Assert.NotNull(persisted);
            Assert.Equal(0, persisted!.Stars);
            Assert.Equal("Only a review", persisted.Review);

            var (ratingCount, _) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, ratingCount);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_WhitespaceReview_IsStoredAsNull()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var result = await service.CreateOrUpdateAsync(workId, user.Id, 3, "   ", default);
            ratingIds.Add(result.Id);

            var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
            Assert.NotNull(persisted);
            Assert.Null(persisted!.Review);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_SecondSave_EditsSameRatingKeepsCreatedAtAndUpdatesUpdatedAt()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var first = await service.CreateOrUpdateAsync(workId, user.Id, 4, "First", default);
            ratingIds.Add(first.Id);

            var second = await service.CreateOrUpdateAsync(workId, user.Id, 5, "Second", default);

            Assert.Equal(first.Id, second.Id);

            var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
            Assert.NotNull(persisted);
            Assert.Equal(5, persisted!.Stars);
            Assert.Equal("Second", persisted.Review);
            Assert.True(Math.Abs((persisted.CreatedAt - first.CreatedAt).TotalMilliseconds) < 1);
            Assert.NotNull(persisted.UpdatedAt);
            Assert.True(persisted.UpdatedAt > persisted.CreatedAt);

            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, ratingCount);
            Assert.Equal(5.0, averageRating, 6);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_CommentOnlyEdit_DoesNotChangeAccumulators()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var first = await service.CreateOrUpdateAsync(workId, user.Id, 4, "First comment", default);
            ratingIds.Add(first.Id);

            await service.CreateOrUpdateAsync(workId, user.Id, 4, "Edited comment", default);

            var (ratingCount, averageRating) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, ratingCount);
            Assert.Equal(4.0, averageRating, 6);

            var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
            Assert.Equal("Edited comment", persisted!.Review);
            Assert.NotNull(persisted.UpdatedAt);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_EditingToAndFromZeroStars_UpdatesAverageWithoutChangingCount()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var firstUser = users[0];
        var secondUser = users[1];
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        try
        {
            var firstVote = await service.CreateOrUpdateAsync(workId, firstUser.Id, 5, null, default);
            ratingIds.Add(firstVote.Id);

            var (countAfterFirst, averageAfterFirst) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(1, countAfterFirst);
            Assert.Equal(5.0, averageAfterFirst, 6);

            var secondVote = await service.CreateOrUpdateAsync(workId, secondUser.Id, 0, null, default);
            ratingIds.Add(secondVote.Id);

            var (countAfterSecond, averageAfterSecond) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(2, countAfterSecond);
            Assert.Equal(2.5, averageAfterSecond, 6);

            await service.CreateOrUpdateAsync(workId, firstUser.Id, 0, null, default);

            var (countAfterThird, averageAfterThird) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(2, countAfterThird);
            Assert.Equal(0.0, averageAfterThird, 6);

            await service.CreateOrUpdateAsync(workId, secondUser.Id, 3, null, default);

            var (countAfterFourth, averageAfterFourth) = await WorkRatingTestSupport.ReadAccumulatorsAsync(_fixture, workId);
            Assert.Equal(2, countAfterFourth);
            Assert.Equal(1.5, averageAfterFourth, 6);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(6)]
    public async Task CreateOrUpdate_ScoreOutOfRange_ThrowsValidationException(int stars)
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var user = users[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        await Assert.ThrowsAsync<ValidationException>(() => service.CreateOrUpdateAsync(workId, user.Id, stars, null, default));

        var persisted = await WorkRatingTestSupport.GetRatingAsync(_fixture, user.Id, workId);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task CreateOrUpdate_UnknownWork_ThrowsNotFound()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => service.CreateOrUpdateAsync(UnknownId, users[0].Id, 3, null, default));
    }

    [Fact]
    public async Task CreateOrUpdate_UnknownUser_ThrowsNotFound()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => service.CreateOrUpdateAsync(workId, UnknownId, 3, null, default));
    }

    [Fact]
    public async Task CreateOrUpdate_InactiveWork_ThrowsNotFound()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        await WorkRatingTestSupport.SetWorkActiveAsync(_fixture, workId, false);

        try
        {
            await Assert.ThrowsAsync<BusinessNotFoundException>(() => service.CreateOrUpdateAsync(workId, users[0].Id, 3, null, default));
        }
        finally
        {
            await WorkRatingTestSupport.SetWorkActiveAsync(_fixture, workId, true);
        }
    }

    [Fact]
    public async Task GetPagedByWorkIdAsync_OrdersByStarsAndCreatedAtInBothDirectionsWithStablePagination()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        var scores = new[] { 3, 0, 5, 3, 4 };

        try
        {
            for (var i = 0; i < users.Count; i++)
            {
                var result = await service.CreateOrUpdateAsync(workId, users[i].Id, scores[i], $"Review {i}", default);
                ratingIds.Add(result.Id);
            }


            var bestRated = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50, orderBy = "Stars", orderDir = "DESC" }, default);
            var worstRated = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50, orderBy = "Stars", orderDir = "ASC" }, default);
            var mostRecent = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50, orderBy = "CreatedAt", orderDir = "DESC" }, default);
            var oldest = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50, orderBy = "CreatedAt", orderDir = "ASC" }, default);
            var defaultOrder = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { pageSize = 50 }, default);

            Assert.Equal(new[] { 5, 4, 3, 3, 0 }, bestRated.Items.Select(item => item.Stars).ToArray());
            Assert.Equal(new[] { 0, 3, 3, 4, 5 }, worstRated.Items.Select(item => item.Stars).ToArray());

            var tiedBestRatedIds = bestRated.Items.Where(item => item.Stars == 3).Select(item => item.Id).ToList();
            var tiedWorstRatedIds = worstRated.Items.Where(item => item.Stars == 3).Select(item => item.Id).ToList();
            Assert.Equal(tiedBestRatedIds.OrderBy(id => id).ToList(), tiedBestRatedIds);
            Assert.Equal(tiedWorstRatedIds.OrderBy(id => id).ToList(), tiedWorstRatedIds);

            AssertSortedByCreatedAt(oldest.Items, ascending: true);
            AssertSortedByCreatedAt(mostRecent.Items, ascending: false);
            Assert.Equal(mostRecent.Items.Select(item => item.Id).ToList(), defaultOrder.Items.Select(item => item.Id).ToList());

            Assert.Equal(ratingIds.Count, bestRated.TotalCount);
            Assert.All(bestRated.Items, item => Assert.False(string.IsNullOrWhiteSpace(item.UserName)));
            Assert.Contains(bestRated.Items, item => item.Stars == 0);
            Assert.Contains(bestRated.Items, item => item.Review == "Review 0");

            var firstPage = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { currentPage = 1, pageSize = 2, orderBy = "Stars", orderDir = "DESC" }, default);
            var secondPage = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { currentPage = 2, pageSize = 2, orderBy = "Stars", orderDir = "DESC" }, default);
            var thirdPage = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { currentPage = 3, pageSize = 2, orderBy = "Stars", orderDir = "DESC" }, default);
            var beyondLastPage = await service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest { currentPage = 4, pageSize = 2, orderBy = "Stars", orderDir = "DESC" }, default);

            Assert.Equal(2, firstPage.Items.Count);
            Assert.True(firstPage.HasNextPage);
            Assert.False(firstPage.HasPriorPage);
            Assert.Equal(2, secondPage.Items.Count);
            Assert.True(secondPage.HasNextPage);
            Assert.True(secondPage.HasPriorPage);
            Assert.Single(thirdPage.Items);
            Assert.False(thirdPage.HasNextPage);
            Assert.True(thirdPage.HasPriorPage);
            Assert.Empty(beyondLastPage.Items);
            Assert.Equal(firstPage.TotalCount, secondPage.TotalCount);
            Assert.DoesNotContain(secondPage.Items.Select(item => item.Id), id => firstPage.Items.Any(item => item.Id == id));
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    private static void AssertSortedByCreatedAt(IReadOnlyList<WorkRatingListItemDto> items, bool ascending)
    {
        var keys = items.Select(item => (item.CreatedAt, item.Id)).ToList();
        var expected = ascending
            ? keys.OrderBy(key => key.CreatedAt).ThenBy(key => key.Id).ToList()
            : keys.OrderByDescending(key => key.CreatedAt).ThenBy(key => key.Id).ToList();

        Assert.Equal(expected, keys);
    }

    [Fact]
    public async Task GetPagedByWorkIdAsync_UnknownWork_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(
            () => service.GetPagedByWorkIdAsync(UnknownId, new GetWorkRatingsRequest(), default));
    }

    [Fact]
    public async Task GetPagedByWorkIdAsync_InactiveWork_ThrowsNotFound()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();

        await WorkRatingTestSupport.SetWorkActiveAsync(_fixture, workId, false);

        try
        {
            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => service.GetPagedByWorkIdAsync(workId, new GetWorkRatingsRequest(), default));
        }
        finally
        {
            await WorkRatingTestSupport.SetWorkActiveAsync(_fixture, workId, true);
        }
    }
}
