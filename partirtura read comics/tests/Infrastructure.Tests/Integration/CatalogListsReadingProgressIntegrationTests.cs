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
public class CatalogListsReadingProgressIntegrationTests
{
    private const long UnknownListId = 9_999_999_999;
    private readonly IntegrationTestFixture _fixture;

    public CatalogListsReadingProgressIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ListProgress_IsNull_WhenUserHasNoProgressOnAnyWork()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await FindListAsync(service, context.WorkListId, context.UserId);

            Assert.Null(detail.ReadingProgressPercentage);
            Assert.All(detail.Works, work => Assert.Null(work.Work.ReadingProgressPercentage));

            var card = await FindCardAsync(service, context.WorkListId, context.UserId);
            Assert.Null(card.ReadingProgressPercentage);
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task ListProgress_ComputesPercentage_FromCompletedWorks()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            await SetProgressAsync(context.UserId, context.WorkId1, ReadingState.Completed, 100);
            await SetProgressAsync(context.UserId, context.WorkId2, ReadingState.Reading, 40);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await FindListAsync(service, context.WorkListId, context.UserId);
            Assert.Equal(50, detail.ReadingProgressPercentage);
            Assert.Equal(100, WorkById(detail, context.WorkId1).ReadingProgressPercentage);
            Assert.Equal(40, WorkById(detail, context.WorkId2).ReadingProgressPercentage);

            var card = await FindCardAsync(service, context.WorkListId, context.UserId);
            Assert.Equal(50, card.ReadingProgressPercentage);
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task ListProgress_IsOneHundred_WhenEveryWorkCompleted()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            await SetProgressAsync(context.UserId, context.WorkId1, ReadingState.Completed, 100);
            await SetProgressAsync(context.UserId, context.WorkId2, ReadingState.Completed, 100);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await FindListAsync(service, context.WorkListId, context.UserId);
            Assert.Equal(100, detail.ReadingProgressPercentage);
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task ListProgress_IsZero_WhenListIsEmpty()
    {
        var context = await CreateListWithWorksAsync(workCount: 0);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await FindListAsync(service, context.WorkListId, context.UserId);
            Assert.Equal(0, detail.ReadingProgressPercentage);
            Assert.Equal(0, detail.WorkCount);
            Assert.Empty(detail.Works);
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task AverageRating_IsNull_WithoutRatings_AndExposed_WithRatings()
    {
        var withoutRatings = await CreateListWithWorksAsync();
        var withRatings = await CreateListWithWorksAsync(ratingCount: 3, averageRating: 4.0);
        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var cardWithoutRatings = await FindCardAsync(service, withoutRatings.WorkListId, withoutRatings.UserId);
            Assert.Null(cardWithoutRatings.AverageRating);
            Assert.Equal(0, cardWithoutRatings.RatingCount);

            var cardWithRatings = await FindCardAsync(service, withRatings.WorkListId, withRatings.UserId);
            Assert.Equal(4.0, cardWithRatings.AverageRating);
            Assert.Equal(3, cardWithRatings.RatingCount);

            var detailWithRatings = await FindListAsync(service, withRatings.WorkListId, withRatings.UserId);
            Assert.Equal(4.0, detailWithRatings.AverageRating);
            Assert.Equal(3, detailWithRatings.RatingCount);
        }
        finally
        {
            await CleanupAsync(withoutRatings);
            await CleanupAsync(withRatings);
        }
    }

    [Fact]
    public async Task AnonymousRequest_ExposesNullProgress_AndSkipsProgressData()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            await SetProgressAsync(context.UserId, context.WorkId1, ReadingState.Completed, 100);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await service.GetCatalogByIdAsync(context.WorkListId, null, default);
            Assert.Null(detail.ReadingProgressPercentage);
            Assert.All(detail.Works, work => Assert.Null(work.Work.ReadingProgressPercentage));

            var card = await FindCardAsync(service, context.WorkListId, null);
            Assert.Null(card.ReadingProgressPercentage);
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task ListProgress_DoesNotGenerateNPlusOneQueries()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            await SetProgressAsync(context.UserId, context.WorkId1, ReadingState.Completed, 100);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            dbContext.ChangeTracker.Clear();

            _ = await service.GetCatalogPagedAsync(new GetCatalogListsRequest { pageSize = 24 }, context.UserId, default);

            Assert.Empty(dbContext.ChangeTracker.Entries<WorkReadingProgress>());
            Assert.Empty(dbContext.ChangeTracker.Entries<WorkListItem>());
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task Detail_NonexistentList_ThrowsBusinessNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

        await Assert.ThrowsAsync<Domain.Exceptions.BusinessNotFoundException>(
            () => service.GetCatalogByIdAsync(UnknownListId, null, default));
    }

    [Fact]
    public async Task ListProgress_IsIsolatedBetweenTwoAuthenticatedUsers()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            var secondUser = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2))[1];
            await SetProgressAsync(secondUser.Id, context.WorkId1, ReadingState.Completed, 100);
            await CreateListReadingProgressAsync(context.UserId, context.WorkListId);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var readerDetail = await service.GetCatalogByIdAsync(context.WorkListId, context.UserId, default);
            var secondDetail = await service.GetCatalogByIdAsync(context.WorkListId, secondUser.Id, default);

            Assert.Null(readerDetail.ReadingProgressPercentage);
            Assert.Equal(50, secondDetail.ReadingProgressPercentage);

            Assert.Null(WorkById(readerDetail, context.WorkId1).ReadingProgressPercentage);
            Assert.Null(WorkById(readerDetail, context.WorkId2).ReadingProgressPercentage);
            Assert.Equal(100, WorkById(secondDetail, context.WorkId1).ReadingProgressPercentage);
            Assert.Null(WorkById(secondDetail, context.WorkId2).ReadingProgressPercentage);
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task ListProgress_IgnoresListTrackingRecord_WithoutWorkProgress()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            await CreateListReadingProgressAsync(context.UserId, context.WorkListId);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await service.GetCatalogByIdAsync(context.WorkListId, context.UserId, default);
            Assert.Null(detail.ReadingProgressPercentage);
            Assert.All(detail.Works, work => Assert.Null(work.Work.ReadingProgressPercentage));
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    [Fact]
    public async Task ListProgress_RecomputesAfterCompositionChanges()
    {
        var context = await CreateListWithWorksAsync();
        try
        {
            await SetProgressAsync(context.UserId, context.WorkId1, ReadingState.Completed, 100);
            await SetProgressAsync(context.UserId, context.WorkId2, ReadingState.Reading, 40);

            using (var scope = _fixture.ScopeFactory.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();
                var before = await service.GetCatalogByIdAsync(context.WorkListId, context.UserId, default);
                Assert.Equal(50, before.ReadingProgressPercentage);
            }

            await RemoveWorkFromListAsync(context.WorkListId, context.WorkId2);

            using (var scope = _fixture.ScopeFactory.CreateScope())
            {
                var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();
                var after = await service.GetCatalogByIdAsync(context.WorkListId, context.UserId, default);
                Assert.Equal(1, after.WorkCount);
                Assert.Equal(100, after.ReadingProgressPercentage);
            }
        }
        finally
        {
            await CleanupAsync(context);
        }
    }

    private async Task CreateListReadingProgressAsync(long userId, long workListId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var user = await dbContext.Users.FirstAsync(existing => existing.Id == userId);
        var workList = await dbContext.WorkLists.FirstAsync(existing => existing.Id == workListId);

        dbContext.ListReadingProgresses.Add(new Domain.Entities.ListReadingProgress
        {
            User = user,
            WorkList = workList,
            CurrentWork = null,
            LastReadAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();
    }

    private async Task RemoveWorkFromListAsync(long workListId, long workId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var item = await dbContext.WorkListItems.FirstAsync(
            existing => existing.WorkList != null && existing.WorkList.Id == workListId &&
                        existing.Work != null && existing.Work.Id == workId);
        dbContext.WorkListItems.Remove(item);
        await dbContext.SaveChangesAsync();
    }

    private static CatalogListWorkDto WorkById(CatalogListDetailDto detail, long workId)
    {
        return detail.Works.Single(work => work.Work.Id == workId).Work;
    }

    private static async Task<CatalogListDetailDto> FindListAsync(
        IWorkListService service,
        long workListId,
        long? userId)
    {
        return await service.GetCatalogByIdAsync(workListId, userId, default);
    }

    private static async Task<CatalogListCardDto> FindCardAsync(
        IWorkListService service,
        long workListId,
        long? userId)
    {
        var page = await service.GetCatalogPagedAsync(new GetCatalogListsRequest { pageSize = 50 }, userId, default);
        return page.Items.Single(item => item.Id == workListId);
    }

    private async Task SetProgressAsync(long userId, long workId, ReadingState state, int percentageReading)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var progress = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, default);
        if (progress is null)
        {
            var work = await dbContext.Works.FirstAsync(existing => existing.Id == workId);
            var user = await dbContext.Users.FirstAsync(existing => existing.Id == userId);
            progress = new WorkReadingProgress
            {
                Work = work,
                User = user,
                CurrentPage = 1,
                TotalPages = 10,
                PercentageReading = percentageReading,
                LastReadAt = DateTimeOffset.UtcNow,
                State = state
            };
            await unitOfWork.WorkReadingProgressRepository.AddAsync(progress, default);
        }
        else
        {
            progress.PercentageReading = percentageReading;
            progress.State = state;
        }

        await unitOfWork.SaveChangesAsync(default);
    }

    private async Task<ListTestContext> CreateListWithWorksAsync(int workCount = 2, int ratingCount = 0, double averageRating = 0.0)
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var unique = Guid.NewGuid().ToString("N");

        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var workType = await dbContext.WorkTypes.FirstAsync();
        var language = await dbContext.Languages.FirstAsync();
        var listType = await dbContext.ListTypes.FirstAsync();

        var workList = new WorkList
        {
            Name = $"US-0034 progress {unique}",
            ListType = listType,
            OwnerType = OwnerType.System,
            Visibility = Visibility.Public,
            IsActive = true,
            RatingCount = ratingCount,
            AverageRating = averageRating,
            WorkListItems = new List<WorkListItem>()
        };

        var createdWorks = new List<Work>();
        for (var position = 1; position <= workCount; position++)
        {
            var work = new Work
            {
                Title = $"US-0034 work {unique} {position}",
                WorkType = workType,
                Language = language,
                IsActive = true,
                ContentStatus = ContentStatus.Missing,
                CreatedAt = DateTime.UtcNow
            };
            await unitOfWork.WorkRepository.AddAsync(work, default);
            workList.WorkListItems.Add(new WorkListItem { Work = work, Position = position });
            createdWorks.Add(work);
        }

        await unitOfWork.WorkListRepository.AddAsync(workList, default);
        await unitOfWork.SaveChangesAsync(default);

        var workIds = createdWorks.Select(work => work.Id).ToList();
        return new ListTestContext(
            workList.Id,
            user.Id,
            workIds.Count > 0 ? workIds[0] : 0,
            workIds.Count > 1 ? workIds[1] : 0,
            workIds);
    }

    private async Task CleanupAsync(ListTestContext context)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var listProgressRows = await dbContext.ListReadingProgresses
            .Where(progress => progress.WorkList != null && progress.WorkList.Id == context.WorkListId)
            .ToListAsync();
        dbContext.ListReadingProgresses.RemoveRange(listProgressRows);

        if (context.WorkIds.Count > 0)
        {
            var progressRows = await dbContext.WorkReadingProgresses
                .Where(progress => progress.Work != null && context.WorkIds.Contains(progress.Work.Id))
                .ToListAsync();
            dbContext.WorkReadingProgresses.RemoveRange(progressRows);
        }

        var items = await dbContext.WorkListItems
            .Where(item => item.WorkList != null && item.WorkList.Id == context.WorkListId)
            .ToListAsync();
        dbContext.WorkListItems.RemoveRange(items);

        var workList = await dbContext.WorkLists.FirstOrDefaultAsync(list => list.Id == context.WorkListId);
        if (workList is not null)
        {
            dbContext.WorkLists.Remove(workList);
        }

        if (context.WorkIds.Count > 0)
        {
            var works = await dbContext.Works.Where(work => context.WorkIds.Contains(work.Id)).ToListAsync();
            dbContext.Works.RemoveRange(works);
        }

        await dbContext.SaveChangesAsync();
    }

    private sealed record ListTestContext(
        long WorkListId,
        long UserId,
        long WorkId1,
        long WorkId2,
        IReadOnlyList<long> WorkIds);
}
