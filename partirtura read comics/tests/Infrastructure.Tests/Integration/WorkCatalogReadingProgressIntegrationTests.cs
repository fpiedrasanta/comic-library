using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkCatalogReadingProgressIntegrationTests
{
    private const int PageSize = 12;
    private readonly IntegrationTestFixture _fixture;

    public WorkCatalogReadingProgressIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetCatalogPaged_AuthenticatedUserWithProgress_ReturnsMyReadingProgressOnlyForOwnWorks()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var pageWorks = await GetPageWorkIdsAsync(1);
        var worksWithPages = new List<long>();

        foreach (var workId in pageWorks)
        {
            if (await ReadWorkPagesCountAsync(_fixture, workId) > 0)
            {
                worksWithPages.Add(workId);
            }

            if (worksWithPages.Count == 3)
            {
                break;
            }
        }

        Assert.True(worksWithPages.Count == 3, "the requested page does not have three works with pages.");

        var initialWork = worksWithPages[0];
        var intermediateWork = worksWithPages[1];
        var completedWork = worksWithPages[2];

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var setupService = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await setupService.UpdateReadingProgressAsync(initialWork, user.Id, 1, default);
            await setupService.UpdateReadingProgressAsync(intermediateWork, user.Id, 4, default);
            await setupService.UpdateReadingProgressAsync(completedWork, user.Id, 99_999, default);
        }

        var progressesByWorkId = await ReadProgressesAsync(pageWorks, user.Id);
        var completedTotalPages = progressesByWorkId[completedWork].TotalPages;

        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var page = await catalog.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = PageSize }, user.Id, default);

        var initialItem = page.Items.Single(item => item.Id == initialWork);
        var intermediateItem = page.Items.Single(item => item.Id == intermediateWork);
        var completedItem = page.Items.Single(item => item.Id == completedWork);

        Assert.NotNull(initialItem.MyReadingProgress);
        Assert.Equal(1, initialItem.MyReadingProgress!.CurrentPage);
        Assert.Equal(0, initialItem.MyReadingProgress.Percentage);
        Assert.Equal("Reading", initialItem.MyReadingProgress.Status);

        Assert.NotNull(intermediateItem.MyReadingProgress);
        Assert.Equal(4, intermediateItem.MyReadingProgress!.CurrentPage);
        Assert.Equal(progressesByWorkId[intermediateWork].PercentageReading, intermediateItem.MyReadingProgress.Percentage);
        Assert.True(intermediateItem.MyReadingProgress.Percentage > 0);
        Assert.True(intermediateItem.MyReadingProgress.Percentage < 100);
        Assert.Equal("Reading", intermediateItem.MyReadingProgress.Status);

        Assert.NotNull(completedItem.MyReadingProgress);
        Assert.Equal(completedTotalPages + 1, completedItem.MyReadingProgress!.CurrentPage);
        Assert.Equal(completedTotalPages, completedItem.MyReadingProgress.TotalPages);
        Assert.Equal(100, completedItem.MyReadingProgress.Percentage);
        Assert.Equal("Completed", completedItem.MyReadingProgress.Status);

        var populated = page.Items.Where(item => item.MyReadingProgress is not null).Select(item => item.Id).ToList();
        Assert.Equal(progressesByWorkId.Keys.OrderBy(id => id).ToList(), populated.OrderBy(id => id).ToList());

        Assert.Empty(dbContext.ChangeTracker.Entries<Work>());
        Assert.Empty(dbContext.ChangeTracker.Entries<WorkReadingProgress>());
    }

    [Fact]
    public async Task GetCatalogPaged_ProgressOfOtherWorksIsNotReturned()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var pageWorks = await GetPageWorkIdsAsync(1);
        var workOutsidePage = await GetWorkOutsidePageAsync(pageWorks);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var setupService = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await setupService.UpdateReadingProgressAsync(workOutsidePage, user.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var page = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = PageSize }, user.Id, default);

        Assert.DoesNotContain(page.Items, item => item.Id == workOutsidePage);
        Assert.All(page.Items, item => Assert.NotEqual(workOutsidePage, item.Id));
        Assert.Equal(pageWorks.Count, page.Items.Count);
    }

    [Fact]
    public async Task GetCatalogPaged_ProgressIsIsolatedPerUser()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);
        var pageWorks = await GetPageWorkIdsAsync(1);
        var votedWork = pageWorks[0];
        var votingUser = users[0];
        var otherUser = users.First(candidate => candidate.Id != votingUser.Id && !HasProgressForWorks(candidate, pageWorks));

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var setupService = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await setupService.UpdateReadingProgressAsync(votedWork, votingUser.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var asVotingUser = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = PageSize }, votingUser.Id, default);
        var asOtherUser = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = PageSize }, otherUser.Id, default);

        Assert.NotNull(asVotingUser.Items.Single(item => item.Id == votedWork).MyReadingProgress);
        Assert.Null(asOtherUser.Items.Single(item => item.Id == votedWork).MyReadingProgress);
        Assert.All(asOtherUser.Items, item => Assert.Null(item.MyReadingProgress));
    }

    [Fact]
    public async Task GetCatalogPaged_AuthenticatedUserWithoutProgressOnPage_ReturnsNullForEveryItem()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);
        var pageWorks = await GetPageWorkIdsAsync(2, 50);
        var user = users.First(candidate => !HasProgressForWorks(candidate, pageWorks));

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var page = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 2, pageSize = 50 }, user.Id, default);

        Assert.Equal(pageWorks, page.Items.Select(item => item.Id).ToList());
        Assert.All(page.Items, item => Assert.Null(item.MyReadingProgress));
    }

    [Fact]
    public async Task GetCatalogPaged_AnonymousUser_ReturnsNullMyReadingProgressForEveryItem()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var pageWorks = await GetPageWorkIdsAsync(1);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var setupService = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await setupService.UpdateReadingProgressAsync(pageWorks[0], user.Id, 99_999, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var page = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = PageSize }, null, default);

        Assert.All(page.Items, item => Assert.Null(item.MyReadingProgress));
    }

    [Fact]
    public async Task GetCatalogPaged_EmptyPage_ReturnsNoItemsAndNoProgress()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var firstPage = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = PageSize }, null, default);
        var beyondLastPage = await service.GetCatalogPagedAsync(
            new GetCatalogWorksRequest { currentPage = firstPage.TotalPages + 5, pageSize = PageSize },
            user.Id,
            default);

        Assert.Empty(beyondLastPage.Items);
        Assert.Equal(firstPage.TotalCount, beyondLastPage.TotalCount);
    }

    [Fact]
    public async Task GetCatalogPaged_KeepsFiltersOrderingAndPagination()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var firstPage = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 1, pageSize = 5, orderBy = "Stars", orderDir = "DESC" }, user.Id, default);
        var secondPage = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = 2, pageSize = 5, orderBy = "Stars", orderDir = "DESC" }, user.Id, default);

        Assert.Equal(5, firstPage.Items.Count);
        Assert.True(firstPage.HasNextPage);
        Assert.False(firstPage.HasPriorPage);
        Assert.True(secondPage.HasPriorPage);
        Assert.DoesNotContain(secondPage.Items.Select(item => item.Id), id => firstPage.Items.Any(item => item.Id == id));
        Assert.Equal(firstPage.TotalCount, secondPage.TotalCount);
    }

    [Fact]
    public async Task GetByWorkIdsAndUserId_EmptyWorkIds_ReturnsEmptyList()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var progresses = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(Array.Empty<long>(), user.Id, default);

        Assert.Empty(progresses);
    }

    [Fact]
    public async Task GetByWorkIdsAndUserId_ReturnsOnlyRequestedWorksOfTheUserInASingleCall()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var user = users[0];
        var otherUser = users[1];
        var pageWorks = await GetPageWorkIdsAsync(1);
        var workOutsidePage = await GetWorkOutsidePageAsync(pageWorks);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var setupService = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await setupService.UpdateReadingProgressAsync(pageWorks[0], user.Id, 3, default);
            await setupService.UpdateReadingProgressAsync(pageWorks[1], user.Id, 3, default);
            await setupService.UpdateReadingProgressAsync(pageWorks[0], otherUser.Id, 3, default);
            await setupService.UpdateReadingProgressAsync(workOutsidePage, user.Id, 3, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var progresses = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(pageWorks, user.Id, default);

        Assert.True(progresses.Count >= 2, $"expected at least 2 progresses, got {progresses.Count}");
        Assert.All(progresses, progress => Assert.Contains(progress.Work!.Id, pageWorks));
        Assert.DoesNotContain(progresses, progress => progress.Work!.Id == workOutsidePage);
        Assert.Contains(progresses, progress => progress.Work!.Id == pageWorks[0]);
        Assert.Contains(progresses, progress => progress.Work!.Id == pageWorks[1]);
    }

    private async Task<List<long>> GetPageWorkIdsAsync(int currentPage, int pageSize = PageSize)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var page = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = currentPage, pageSize = pageSize }, null, default);

        return page.Items.Select(item => item.Id).ToList();
    }

    private async Task<long> GetWorkOutsidePageAsync(IReadOnlyCollection<long> pageWorkIds)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var everything = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 50 }, null, default);

        var outside = everything.Items.FirstOrDefault(item => !pageWorkIds.Contains(item.Id));

        if (outside is null)
        {
            throw new InvalidOperationException("The development database does not have a work outside the requested page.");
        }

        return outside.Id;
    }

    private async Task<Dictionary<long, WorkReadingProgress>> ReadProgressesAsync(IReadOnlyCollection<long> workIds, long userId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var progresses = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(workIds, userId, default);

        return progresses.ToDictionary(progress => progress.Work!.Id);
    }

    private async Task<int> ReadWorkPagesCountAsync(IntegrationTestFixture fixture, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);

        if (work is null)
        {
            throw new InvalidOperationException($"Work {workId} no longer exists in the development database.");
        }

        return work.Pages?.Count ?? 0;
    }

    private bool HasProgressForWorks(User user, IReadOnlyCollection<long> workIds)
    {
        var progresses = ReadProgressesAsync(workIds, user.Id).GetAwaiter().GetResult();

        return progresses.Count > 0;
    }
}
