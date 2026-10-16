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
public class WorkListReaderIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public WorkListReaderIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CurrentWorkId_IsNull_ForEmptyList()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 0);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var workListService = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await workListService.GetCatalogByIdAsync(context.WorkListId, context.UserId, default);

            Assert.Null(detail.CurrentWorkId);
            Assert.Equal(0, detail.WorkCount);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CurrentWorkId_FallsBackToFirstWork_ForUserWithoutListProgress()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListReaderService>();

            var result = await service.GetReaderContextAsync(context.WorkListId, context.WorkId1, context.UserId, default);

            Assert.Equal(context.WorkId1, result.List.CurrentWorkId);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CurrentWorkId_ResolvesSavedCurrentWork_ForAuthenticatedUser()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            await WorkListTestSupport.SetListCurrentWorkAsync(_fixture, context.UserId, context.WorkListId, context.WorkId2);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListReaderService>();

            var result = await service.GetReaderContextAsync(context.WorkListId, context.WorkId1, context.UserId, default);

            Assert.Equal(context.WorkId2, result.List.CurrentWorkId);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task CurrentWorkId_FallsBack_WhenSavedCurrentWorkNotInList()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            await WorkListTestSupport.SetListCurrentWorkAsync(_fixture, context.UserId, context.WorkListId, context.WorkId1);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<Infrastructure.Persistence.ApplicationDbContext>();

            var workList = await dbContext.WorkLists.FirstAsync(list => list.Id == context.WorkListId);
            dbContext.Entry(workList).Collection(list => list.WorkListItems).Load();
            var strayWork = new Domain.Entities.Work
            {
                Title = "Stray work",
                WorkType = await dbContext.WorkTypes.FirstAsync(),
                Language = await dbContext.Languages.FirstAsync(),
                IsActive = true,
                ContentStatus = Domain.Enums.ContentStatus.Missing,
                CreatedAt = DateTime.UtcNow
            };
            await dbContext.Works.AddAsync(strayWork);
            await dbContext.SaveChangesAsync();

            var listProgress = await dbContext.ListReadingProgresses.FirstAsync(progress => progress.WorkList.Id == context.WorkListId && progress.User.Id == context.UserId);
            dbContext.Entry(listProgress).Property("CurrentWorkId").CurrentValue = strayWork.Id;
            await dbContext.SaveChangesAsync();

            using var assertScope = _fixture.ScopeFactory.CreateScope();
            var service = assertScope.ServiceProvider.GetRequiredService<IListReaderService>();
            var result = await service.GetReaderContextAsync(context.WorkListId, context.WorkId1, context.UserId, default);

            Assert.Equal(context.WorkId1, result.List.CurrentWorkId);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task ReaderContext_ReturnsCompleteListAndWorkContext()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            await WorkListTestSupport.SetProgressAsync(_fixture, context.UserId, context.WorkId1, Domain.Enums.ReadingState.Reading, 50, currentPage: 3, totalPages: 10);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var listRatingService = scope.ServiceProvider.GetRequiredService<IListRatingService>();
            var workRatingService = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
            var readerService = scope.ServiceProvider.GetRequiredService<IListReaderService>();

            var listRating = await listRatingService.CreateOrUpdateAsync(context.WorkListId, context.UserId, 5, "Great list", default);
            var workRating = await workRatingService.CreateOrUpdateAsync(context.WorkId1, context.UserId, 4, "Nice", default);

            try
            {
                var result = await readerService.GetReaderContextAsync(context.WorkListId, context.WorkId1, context.UserId, default);

                Assert.Equal(context.WorkListId, result.List.Id);
                Assert.Equal(5, result.List.MyRating!.Stars);
                Assert.Equal("Great list", result.List.MyRating.Review);
                Assert.Equal(1, result.List.RatingCount);

                var firstWork = result.Works[0];
                Assert.Equal(context.WorkId1, firstWork.Work.Id);
                Assert.Equal(1, firstWork.Position);
                Assert.Equal(50, firstWork.Work.ReadingProgressPercentage);
                Assert.Equal(3, firstWork.CurrentPage);
                Assert.Equal(4, firstWork.MyRating!.Stars);

                Assert.Equal(context.WorkId1, result.WorkId);
                Assert.Empty(result.Pages);
                Assert.Equal(3, result.CurrentPage);
                Assert.Equal(4, result.MyRating!.Stars);
            }
            finally
            {
                await CleanupRatingsAsync(context);
            }
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task ReaderContext_ThrowsNotFound_WhenWorkNotBelongsToList()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IListReaderService>();

            await Assert.ThrowsAsync<Domain.Exceptions.BusinessNotFoundException>(
                () => service.GetReaderContextAsync(context.WorkListId, 9_999_999_997, context.UserId, default));
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task ReaderContext_ThrowsNotFound_ForNonexistentList()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IListReaderService>();

        await Assert.ThrowsAsync<Domain.Exceptions.BusinessNotFoundException>(
            () => service.GetReaderContextAsync(9_999_999_999, 1, 1, default));
    }

    [Fact]
    public async Task SetCurrentWork_PersistsCurrentWorkAndLastReadAt()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            await service.SetCurrentWorkAsync(context.WorkListId, context.UserId, context.WorkId2, default);

            var currentWorkId = await WorkListTestSupport.GetListCurrentWorkIdAsync(_fixture, context.UserId, context.WorkListId);
            Assert.Equal(context.WorkId2, currentWorkId);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task SetCurrentWork_UpdatesCurrentWork_WhenAlreadyCreated()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            await WorkListTestSupport.SetListCurrentWorkAsync(_fixture, context.UserId, context.WorkListId, context.WorkId1);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            await service.SetCurrentWorkAsync(context.WorkListId, context.UserId, context.WorkId2, default);

            var currentWorkId = await WorkListTestSupport.GetListCurrentWorkIdAsync(_fixture, context.UserId, context.WorkListId);
            Assert.Equal(context.WorkId2, currentWorkId);
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task SetCurrentWork_ThrowsNotFound_WhenWorkNotBelongsToList()
    {
        var context = await WorkListTestSupport.CreateListAsync(_fixture, workCount: 2);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            await Assert.ThrowsAsync<Domain.Exceptions.BusinessNotFoundException>(
                () => service.SetCurrentWorkAsync(context.WorkListId, context.UserId, 9_999_999_997, default));
        }
        finally
        {
            await WorkListTestSupport.CleanupAsync(_fixture, context);
        }
    }

    [Fact]
    public async Task SetCurrentWork_ThrowsNotFound_ForNonexistentList()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

        await Assert.ThrowsAsync<Domain.Exceptions.BusinessNotFoundException>(
            () => service.SetCurrentWorkAsync(9_999_999_999, 1, 1, default));
    }

    private async Task CleanupRatingsAsync(ListTestContext context)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<Infrastructure.Persistence.ApplicationDbContext>();

        var workRatingRows = await dbContext.WorkRatings
            .Where(rating => rating.Work != null && context.WorkIds.Contains(rating.Work.Id))
            .ToListAsync();
        dbContext.WorkRatings.RemoveRange(workRatingRows);

        var listRatingRows = await dbContext.ListRatings
            .Where(rating => rating.WorkList != null && rating.WorkList.Id == context.WorkListId)
            .ToListAsync();
        dbContext.ListRatings.RemoveRange(listRatingRows);

        if (context.WorkIds.Count > 0)
        {
            var works = await dbContext.Works.Where(work => context.WorkIds.Contains(work.Id)).ToListAsync();
            foreach (var work in works)
            {
                work.RatingCount = 0;
                work.AverageRating = 0.0;
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
