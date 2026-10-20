using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class PersonalListMembershipIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public PersonalListMembershipIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Catalog_ReportsThatTheWorkBelongsToAPersonalListOfTheUser()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            await AddWorkAsync(listId, workIds[0], user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var response = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), user.Id, default);
            var item = response.Items.FirstOrDefault(candidate => candidate.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.True(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_ReportsThatTheWorkBelongsToSeveralPersonalListsOfTheUser()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var firstListId = 0L;
        var secondListId = 0L;

        try
        {
            firstListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            secondListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            await AddWorkAsync(firstListId, workIds[0], user.Id);
            await AddWorkAsync(secondListId, workIds[0], user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var response = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), user.Id, default);
            var item = response.Items.FirstOrDefault(candidate => candidate.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.True(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, firstListId);
            await PersonalListTestSupport.CleanupAsync(_fixture, secondListId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_ReportsFalseWhenTheWorkIsNotInAPersonalListOfTheUser()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var response = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), user.Id, default);
            var item = response.Items.FirstOrDefault(candidate => candidate.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.False(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_ReportsFalseWhenTheWorkOnlyBelongsToASystemList()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var systemListId = await PersonalListTestSupport.GetFirstSystemListIdAsync(_fixture);

        try
        {
            await PersonalListTestSupport.AddWorkToSystemListAsync(_fixture, systemListId, workIds[0]);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var response = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), user.Id, default);
            var item = response.Items.FirstOrDefault(candidate => candidate.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.False(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupSystemListItemsAsync(_fixture, systemListId, workIds[0]);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_ReportsFalseWhenTheWorkOnlyBelongsToAPersonalListOfAnotherUser()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, users[1].Id);
            await AddWorkAsync(listId, workIds[0], users[1].Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var response = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), users[0].Id, default);
            var item = response.Items.FirstOrDefault(candidate => candidate.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.False(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, users[0].Id, workIds);
        }
    }

    [Fact]
    public async Task ReadingHistory_ExposesThePersonalListMembership()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            await AddWorkAsync(listId, workIds[0], user.Id);
            await WorkListTestSupport.SetProgressAsync(_fixture, user.Id, workIds[0], Domain.Enums.ReadingState.Reading, 10);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var historyService = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

            var history = await historyService.GetPagedAsync(new GetReadingHistoryRequest(pageSize: 50), user.Id, default);
            var item = history.Items.FirstOrDefault(entry => entry.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.True(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task RecommendedWorks_ExposeThePersonalListMembership()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            await AddWorkAsync(listId, workIds[0], user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommendedService = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var recommended = await recommendedService.GetRecommendedAsync(user.Id, Application.Constants.RecommendedSortFields.RecentlyAdded, default);
            var item = recommended.FirstOrDefault(entry => entry.Id == workIds[0]);

            Assert.NotNull(item);
            Assert.True(item!.IsInPersonalList);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task GetPersonalLists_ReturnsOnlyThePersonalListsOfTheUser()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var ownListId = 0L;
        var otherUserListId = 0L;

        try
        {
            ownListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, users[0].Id, $"US-0036 propia {Guid.NewGuid():N}");
            otherUserListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, users[1].Id, $"US-0036 ajena {Guid.NewGuid():N}");

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            var lists = await personalListService.GetWithMembershipAsync(new GetPersonalListsRequest(), users[0].Id, default);

            Assert.Contains(lists, list => list.Id == ownListId);
            Assert.DoesNotContain(lists, list => list.Id == otherUserListId);
            Assert.All(lists, list => Assert.False(list.ContainsWork));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, ownListId);
            await PersonalListTestSupport.CleanupAsync(_fixture, otherUserListId);
        }
    }

    [Fact]
    public async Task GetPersonalLists_NeverReturnsSystemLists()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var systemListId = await PersonalListTestSupport.GetFirstSystemListIdAsync(_fixture);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

        var lists = await personalListService.GetWithMembershipAsync(new GetPersonalListsRequest(), user.Id, default);

        Assert.DoesNotContain(lists, list => list.Id == systemListId);
    }

    [Fact]
    public async Task GetPersonalLists_OrdersTheListsThatContainTheWorkFirstAndThenByName()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var suffix = Guid.NewGuid().ToString("N");
        var listIds = new List<long>();

        try
        {
            foreach (var name in new[] { "B", "A", "C" })
            {
                listIds.Add(await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id, $"US-0036 {name} {suffix}"));
            }

            await AddWorkAsync(listIds[1], workIds[0], user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            var lists = await personalListService.GetWithMembershipAsync(
                new GetPersonalListsRequest(search: $"US-0036 ", workId: workIds[0]),
                user.Id,
                default);

            var mine = lists.Where(list => listIds.Contains(list.Id)).ToList();

            Assert.Equal(3, mine.Count);
            Assert.Equal(listIds[1], mine[0].Id);
            Assert.True(mine[0].ContainsWork);
            Assert.False(mine[1].ContainsWork);
            Assert.False(mine[2].ContainsWork);
            Assert.Equal(
                mine.Skip(1).Select(list => list.Name).OrderBy(name => name, StringComparer.Ordinal).ToList(),
                mine.Skip(1).Select(list => list.Name).ToList());
        }
        finally
        {
            foreach (var listId in listIds)
            {
                await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            }

            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task GetPersonalLists_FiltersBySearchAndLimitsTheResults()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var suffix = Guid.NewGuid().ToString("N");
        var matchingListId = 0L;
        var otherListId = 0L;

        try
        {
            matchingListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id, $"US-0036 coincide {suffix}");
            otherListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id, $"US-0036 distinto {suffix}");

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            var filtered = await personalListService.GetWithMembershipAsync(
                new GetPersonalListsRequest(search: $"coincide {suffix}"),
                user.Id,
                default);

            Assert.Contains(filtered, list => list.Id == matchingListId);
            Assert.DoesNotContain(filtered, list => list.Id == otherListId);

            var limited = await personalListService.GetWithMembershipAsync(
                new GetPersonalListsRequest(search: $"US-0036 ", pageSize: 1),
                user.Id,
                default);

            Assert.Single(limited);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, matchingListId);
            await PersonalListTestSupport.CleanupAsync(_fixture, otherListId);
        }
    }

    [Fact]
    public async Task GetPersonalLists_RejectsAnInvalidPageSize()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

        await Assert.ThrowsAsync<ValidationException>(
            () => personalListService.GetWithMembershipAsync(new GetPersonalListsRequest(pageSize: 0), user.Id, default));
    }

    private async Task AddWorkAsync(long listId, long workId, long userId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();
        await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workId), userId, default);
    }
}
