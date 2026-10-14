using Application.DTOs;
using Domain.Exceptions;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class ReadingHistoryIntegrationTests
{
    private const int PageSize = 12;
    private readonly IntegrationTestFixture _fixture;

    public ReadingHistoryIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetPaged_UserWithHistory_ReturnsWorksOrderedByLastReadAtDescending()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var works = await PickWorksWithPagesAsync(3);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();

            await service.UpdateReadingProgressAsync(works[0], user.Id, 2, default);
            await Task.Delay(20);
            await service.UpdateReadingProgressAsync(works[1], user.Id, 2, default);
            await Task.Delay(20);
            await service.UpdateReadingProgressAsync(works[2], user.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var page = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, user.Id, default);

        var firstThree = page.Items.Take(3).Select(item => item.Id).ToList();
        Assert.Equal(new[] { works[2], works[1], works[0] }, firstThree);

        Assert.All(page.Items, item => Assert.NotNull(item.MyReadingProgress));
        Assert.NotNull(page.Items.Single(item => item.Id == works[2]).MyReadingProgress);
        Assert.Equal("Completed", page.Items.Single(item => item.Id == works[2]).MyReadingProgress!.Status);

        Assert.Empty(dbContext.ChangeTracker.Entries<Work>());
        Assert.Empty(dbContext.ChangeTracker.Entries<WorkReadingProgress>());
    }

    [Fact]
    public async Task GetPaged_StateFilter_ReturnsOnlyRequestedState()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var works = await PickWorksWithPagesAsync(2);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();

            await service.UpdateReadingProgressAsync(works[0], user.Id, 2, default);
            await Task.Delay(20);
            await service.UpdateReadingProgressAsync(works[1], user.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        var reading = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50, state = "reading" }, user.Id, default);
        var completed = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50, state = "completed" }, user.Id, default);

        Assert.Contains(reading.Items, item => item.Id == works[0]);
        Assert.DoesNotContain(reading.Items, item => item.Id == works[1]);
        Assert.All(reading.Items, item => Assert.Equal("Reading", item.MyReadingProgress!.Status));

        Assert.Contains(completed.Items, item => item.Id == works[1]);
        Assert.DoesNotContain(completed.Items, item => item.Id == works[0]);
        Assert.All(completed.Items, item => Assert.Equal("Completed", item.MyReadingProgress!.Status));
    }

    [Fact]
    public async Task GetPaged_AllAndUnknownState_ReturnTheCompleteHistory()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var works = await PickWorksWithPagesAsync(2);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();

            await service.UpdateReadingProgressAsync(works[0], user.Id, 2, default);
            await Task.Delay(20);
            await service.UpdateReadingProgressAsync(works[1], user.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        var withoutState = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, user.Id, default);
        var allState = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50, state = "all" }, user.Id, default);
        var unknownState = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50, state = "foo" }, user.Id, default);

        Assert.Equal(withoutState.TotalCount, allState.TotalCount);
        Assert.Equal(withoutState.TotalCount, unknownState.TotalCount);
        Assert.Contains(allState.Items, item => item.Id == works[0]);
        Assert.Contains(allState.Items, item => item.Id == works[1]);
        Assert.Contains(unknownState.Items, item => item.Id == works[0]);
        Assert.Contains(unknownState.Items, item => item.Id == works[1]);
    }

    [Fact]
    public async Task GetPaged_UserWithoutHistory_ReturnsEmptyList()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);
        var user = users.First(candidate => !HasHistoryAsync(candidate));

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        var page = await history.GetPagedAsync(new GetReadingHistoryRequest(), user.Id, default);

        Assert.Empty(page.Items);
        Assert.Equal(0, page.TotalCount);
        Assert.Equal(0, page.TotalPages);
        Assert.False(page.HasNextPage);
        Assert.False(page.HasPriorPage);
    }

    [Fact]
    public async Task GetPaged_HistoryIsIsolatedPerUser()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);
        var owner = users[0];
        var other = users.First(candidate => candidate.Id != owner.Id && !HasHistoryAsync(candidate));
        var works = await PickWorksWithPagesAsync(1);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await service.UpdateReadingProgressAsync(works[0], owner.Id, 3, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        var ownerPage = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, owner.Id, default);
        var otherPage = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, other.Id, default);

        Assert.Contains(ownerPage.Items, item => item.Id == works[0]);
        Assert.DoesNotContain(otherPage.Items, item => item.Id == works[0]);
    }

    [Fact]
    public async Task GetPaged_ExcludesInactiveWorks()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var works = await PickWorksWithPagesAsync(1);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await service.UpdateReadingProgressAsync(works[0], user.Id, 3, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var beforeDeactivation = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, user.Id, default);
        Assert.Contains(beforeDeactivation.Items, item => item.Id == works[0]);

        var work = await unitOfWork.WorkRepository.GetByIdAsync(works[0], default);
        work!.IsActive = false;
        await unitOfWork.SaveChangesAsync(default);

        try
        {
            var whileInactive = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, user.Id, default);

            Assert.DoesNotContain(whileInactive.Items, item => item.Id == works[0]);
        }
        finally
        {
            var workToRestore = await unitOfWork.WorkRepository.GetByIdAsync(works[0], default);
            workToRestore!.IsActive = true;
            await unitOfWork.SaveChangesAsync(default);
        }
    }

    [Fact]
    public async Task GetPaged_ReturnsWorkCardDataAndStoredProgress()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var works = await PickWorksWithPagesAsync(1);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await service.UpdateReadingProgressAsync(works[0], user.Id, 3, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var page = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50 }, user.Id, default);
        var item = page.Items.Single(candidate => candidate.Id == works[0]);
        var persisted = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(works[0], user.Id, default);

        Assert.False(string.IsNullOrWhiteSpace(item.Title));
        Assert.NotNull(item.MyReadingProgress);
        Assert.Equal(persisted!.CurrentPage, item.MyReadingProgress!.CurrentPage);
        Assert.Equal(persisted.TotalPages, item.MyReadingProgress.TotalPages);
        Assert.Equal(persisted.PercentageReading, item.MyReadingProgress.Percentage);
        Assert.Equal(persisted.LastReadAt, item.MyReadingProgress.LastReadAt);
        Assert.Equal("Reading", item.MyReadingProgress.Status);

        var completed = await history.GetPagedAsync(new GetReadingHistoryRequest { pageSize = 50, state = "completed" }, user.Id, default);
        Assert.All(
            completed.Items.Where(item => item.MyReadingProgress!.TotalPages > 0),
            item => Assert.Equal(100, item.MyReadingProgress!.Percentage));
    }

    [Fact]
    public async Task GetPaged_PaginatesWithStableMetadata()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var historyCount = await ReadHistoryCountAsync(user.Id);
        Assert.True(historyCount >= 2, "the user needs at least two works in history for this test.");

        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        var firstPage = await history.GetPagedAsync(new GetReadingHistoryRequest { currentPage = 1, pageSize = 2 }, user.Id, default);
        var secondPage = await history.GetPagedAsync(new GetReadingHistoryRequest { currentPage = 2, pageSize = 2 }, user.Id, default);

        Assert.Equal(2, firstPage.Items.Count);
        Assert.Equal(historyCount, firstPage.TotalCount);
        Assert.Equal(firstPage.TotalCount, secondPage.TotalCount);
        Assert.DoesNotContain(secondPage.Items.Select(item => item.Id), id => firstPage.Items.Any(item => item.Id == id));

        var normalized = await history.GetPagedAsync(new GetReadingHistoryRequest { currentPage = 0, pageSize = -5 }, user.Id, default);
        Assert.Equal(1, normalized.CurrentPage);
        Assert.Equal(PaginationGuard.DefaultPageSize, normalized.PageSize);
    }

    [Fact]
    public async Task GetPaged_InvalidUserId_ThrowsValidationException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var history = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

        await Assert.ThrowsAsync<ValidationException>(() => history.GetPagedAsync(new GetReadingHistoryRequest(), 0, default));
    }

    [Fact]
    public async Task GetPagedByUserIdAsync_ReturnsPagedHistoryOrderedAndFiltered()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var works = await PickWorksWithPagesAsync(2);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();

            await service.UpdateReadingProgressAsync(works[0], user.Id, 2, default);
            await Task.Delay(20);
            await service.UpdateReadingProgressAsync(works[1], user.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var all = await unitOfWork.WorkReadingProgressRepository.GetPagedHistoryByUserIdAsync(user.Id, null, 1, 50, default);
        var completed = await unitOfWork.WorkReadingProgressRepository.GetPagedHistoryByUserIdAsync(user.Id, Domain.Enums.ReadingState.Completed, 1, 50, default);

        Assert.True(all.TotalCount >= 2);
        Assert.Contains(all.Items, progress => progress.Work!.Id == works[0]);
        Assert.Contains(all.Items, progress => progress.Work!.Id == works[1]);
        Assert.All(completed.Items, progress => Assert.Equal(Domain.Enums.ReadingState.Completed, progress.State));
        Assert.Contains(completed.Items, progress => progress.Work!.Id == works[1]);

        var firstPage = await unitOfWork.WorkReadingProgressRepository.GetPagedHistoryByUserIdAsync(user.Id, null, 1, 1, default);
        Assert.Single(firstPage.Items);
        Assert.Equal(all.TotalCount, firstPage.TotalCount);
    }

    private async Task<List<long>> PickWorksWithPagesAsync(int count)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 50 }, null, default);
        var selected = new List<long>();

        foreach (var item in catalog.Items)
        {
            var work = await unitOfWork.WorkRepository.GetByIdAsync(item.Id, default);

            if (work is not null && work.Pages?.Count > 0)
            {
                selected.Add(item.Id);

                if (selected.Count == count)
                {
                    break;
                }
            }
        }

        if (selected.Count < count)
        {
            throw new InvalidOperationException($"The development database does not have {count} active works with pages to run the reading history tests.");
        }

        return selected;
    }

    private async Task<int> ReadHistoryCountAsync(long userId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var (_, totalCount) = await unitOfWork.WorkReadingProgressRepository.GetPagedHistoryByUserIdAsync(userId, null, 1, 1, default);

        return totalCount;
    }

    private bool HasHistoryAsync(User user)
    {
        var count = ReadHistoryCountAsync(user.Id).GetAwaiter().GetResult();

        return count > 0;
    }
}
