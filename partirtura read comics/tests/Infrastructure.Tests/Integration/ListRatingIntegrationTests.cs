using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class ListRatingIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public ListRatingIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateOrUpdate_FirstVote_CreatesActiveRatingAndUpdatesAccumulators()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 1);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListRatingService>();

            var result = await service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 4, "Great", default);

            Assert.Equal(4, result.Stars);
            Assert.Equal("Great", result.Review);
            Assert.Null(result.UpdatedAt);
            Assert.Equal(context.WorkListId, result.WorkListId);

            var rating = await WorkListTestSupport.GetListRatingAsync(_fixture, context.UserId, context.WorkListId);
            Assert.NotNull(rating);
            Assert.True(rating!.IsActive);
            Assert.Equal(4, rating.Stars);

            var (count, average) = await WorkListTestSupport.ReadListAccumulatorsAsync(_fixture, context.WorkListId);
            Assert.Equal(1, count);
            Assert.Equal(4.0, average, 6);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_EditExisting_UpdatesStarsKeepsCountAndRecomputesAverage()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 1);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListRatingService>();

            await service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 5, "OK", default);
            var result = await service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 3, "Edited", default);

            Assert.Equal(3, result.Stars);
            Assert.Equal("Edited", result.Review);
            Assert.NotNull(result.UpdatedAt);

            var (count, average) = await WorkListTestSupport.ReadListAccumulatorsAsync(_fixture, context.WorkListId);
            Assert.Equal(1, count);
            Assert.Equal(3.0, average, 6);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_ReactivatesInactiveRating_AndIncrementsCount()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 1);
        try
        {
            await CreateInactiveListRatingAsync(context);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListRatingService>();

            var result = await service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 5, "Back", default);

            var rating = await WorkListTestSupport.GetListRatingAsync(_fixture, context.UserId, context.WorkListId);
            Assert.True(rating!.IsActive);
            Assert.Equal(5, rating.Stars);

            var (count, average) = await WorkListTestSupport.ReadListAccumulatorsAsync(_fixture, context.WorkListId);
            Assert.Equal(1, count);
            Assert.Equal(5.0, average, 6);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_RejectsStarsOutOfRange()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 1);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListRatingService>();

            await Assert.ThrowsAsync<Domain.Exceptions.ValidationException>(
                () => service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 0, null, default));

            await Assert.ThrowsAsync<Domain.Exceptions.ValidationException>(
                () => service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 6, null, default));
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CreateOrUpdate_AccumulatorsTrackMultipleUsersAcrossEdits()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 1);
        var secondUser = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2))[1];
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListRatingService>();

            await service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 4, null, default);
            await service.CreateOrUpdateAsync(context.WorkListId, secondUser.Id, 2, null, default);

            var (countAfterTwo, averageAfterTwo) = await WorkListTestSupport.ReadListAccumulatorsAsync(_fixture, context.WorkListId);
            Assert.Equal(2, countAfterTwo);
            Assert.Equal(3.0, averageAfterTwo, 6);

            await service.CreateOrUpdateAsync(context.WorkListId, context.UserId, 5, null, default);

            var (countAfterEdit, averageAfterEdit) = await WorkListTestSupport.ReadListAccumulatorsAsync(_fixture, context.WorkListId);
            Assert.Equal(2, countAfterEdit);
            Assert.Equal(3.5, averageAfterEdit, 6);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    private async Task CreateInactiveListRatingAsync(ListTestContext context)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user = await dbContext.Users.FirstAsync(existing => existing.Id == context.UserId);
        var workList = await dbContext.WorkLists.FirstAsync(existing => existing.Id == context.WorkListId);

        var rating = new ListRating
        {
            WorkList = workList,
            User = user,
            Stars = 2,
            Review = "old",
            CreatedAt = DateTime.UtcNow,
            IsActive = false
        };
        await dbContext.ListRatings.AddAsync(rating);
        await dbContext.SaveChangesAsync();
    }
}
