using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class PersonalListsIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public PersonalListsIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreatePersonalList_PersistsTheExpectedValues()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id, "Mi lista personal");

            var workList = await PersonalListTestSupport.GetListAsync(_fixture, listId);
            Assert.NotNull(workList);
            Assert.Equal("Mi lista personal", workList!.Name);
            Assert.Equal(OwnerType.User, workList.OwnerType);
            Assert.Equal(Visibility.Private, workList.Visibility);
            Assert.True(workList.IsActive);
            Assert.Null(workList.ListType);
            Assert.Equal(Application.Constants.PersonalListDefaults.Color, workList.Color);
            Assert.Contains("Lista creada por", workList.Description);
            Assert.NotNull(workList.Cover);
            Assert.NotEmpty(workList.Cover!.StoragePath);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task CreatePersonalList_PersistsAnIndependentCoverPerList()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var firstListId = 0L;
        var secondListId = 0L;

        try
        {
            firstListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            secondListId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            var first = await PersonalListTestSupport.GetListAsync(_fixture, firstListId);
            var second = await PersonalListTestSupport.GetListAsync(_fixture, secondListId);

            Assert.NotNull(first?.Cover);
            Assert.NotNull(second?.Cover);
            Assert.NotEqual(first!.Cover!.Id, second!.Cover!.Id);
            Assert.NotEqual(first.Cover.StoragePath, second.Cover!.StoragePath);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, firstListId);
            await PersonalListTestSupport.CleanupAsync(_fixture, secondListId);
        }
    }

    [Fact]
    public async Task CreatePersonalList_RejectsADuplicatedName()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var name = $"US-0036 duplicada {Guid.NewGuid():N}";
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id, name);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            await Assert.ThrowsAsync<BusinessConflictException>(
                () => personalListService.CreateAsync(new CreatePersonalListRequest(name), user.Id, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task RenamePersonalList_ChangesOnlyTheName()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            var before = await PersonalListTestSupport.GetListAsync(_fixture, listId);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            await personalListService.RenameAsync(listId, new UpdatePersonalListRequest("Nuevo nombre"), user.Id, default);

            var after = await PersonalListTestSupport.GetListAsync(_fixture, listId);
            Assert.Equal("Nuevo nombre", after!.Name);
            Assert.Equal(before!.Description, after.Description);
            Assert.Equal(before.Color, after.Color);
            Assert.Equal(before.Cover!.Id, after.Cover!.Id);
            Assert.Equal(before.Owner!.Id, after.Owner!.Id);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task DeletePersonalList_RemovesTheListAndItsItemsWithoutRemovingTheWorks()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using (var scope = _fixture.ScopeFactory.CreateScope())
            {
                var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();
                await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workIds[0]), user.Id, default);
            }

            Assert.Equal(1, await PersonalListTestSupport.CountItemsAsync(_fixture, listId));

            using (var scope = _fixture.ScopeFactory.CreateScope())
            {
                var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();
                await personalListService.DeleteAsync(listId, user.Id, default);
            }

            Assert.Null(await PersonalListTestSupport.GetListAsync(_fixture, listId));
            Assert.Equal(0, await PersonalListTestSupport.CountItemsAsync(_fixture, listId));

            using var verificationScope = _fixture.ScopeFactory.CreateScope();
            var workService = verificationScope.ServiceProvider.GetRequiredService<IWorkService>();
            var work = await workService.GetCatalogByIdAsync(workIds[0], user.Id, default);
            Assert.NotNull(work);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task AddWork_CreatesTheRelationAndRejectsDuplicates()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            var summary = await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workIds[0]), user.Id, default);
            Assert.Equal(1, summary.WorkCount);

            await Assert.ThrowsAsync<BusinessConflictException>(
                () => personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workIds[0]), user.Id, default));

            var items = await PersonalListTestSupport.GetItemPositionsAsync(_fixture, listId);
            Assert.Single(items);
            Assert.Equal(workIds[0], items[0].WorkId);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task AddWork_RejectsAnUnknownWork()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(long.MaxValue), user.Id, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task RemoveWork_DeletesOnlyTheRelationAndKeepsTheWork()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workIds[0]), user.Id, default);
            await personalListService.RemoveWorkAsync(listId, workIds[0], user.Id, default);

            Assert.Equal(0, await PersonalListTestSupport.CountItemsAsync(_fixture, listId));

            using var verificationScope = _fixture.ScopeFactory.CreateScope();
            var workService = verificationScope.ServiceProvider.GetRequiredService<IWorkService>();
            Assert.NotNull(await workService.GetCatalogByIdAsync(workIds[0], user.Id, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task ReorderWorks_PersistsTheNewOrderOfTheAffectedWorks()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 4);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using (var scope = _fixture.ScopeFactory.CreateScope())
            {
                var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

                foreach (var workId in workIds)
                {
                    await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workId), user.Id, default);
                }
            }

            using (var scope = _fixture.ScopeFactory.CreateScope())
            {
                var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

                // Mirrors the drag & drop contract: only the works whose position changes are sent.
                // Initial order: a=0, b=1, c=2, d=3. Moving d to the place of c results in a=0, d=1, b=2, c=3.
                var request = new ReorderPersonalListWorksRequest(new[]
                {
                    new PersonalListWorkPositionRequest(workIds[3], 1),
                    new PersonalListWorkPositionRequest(workIds[1], 2),
                    new PersonalListWorkPositionRequest(workIds[2], 3)
                });

                await personalListService.ReorderWorksAsync(listId, request, user.Id, default);
            }

            var items = await PersonalListTestSupport.GetItemPositionsAsync(_fixture, listId);
            Assert.Equal(4, items.Count);
            Assert.Equal(workIds[0], items[0].WorkId);
            Assert.Equal(workIds[3], items[1].WorkId);
            Assert.Equal(workIds[1], items[2].WorkId);
            Assert.Equal(workIds[2], items[3].WorkId);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task ReorderWorks_RejectsAWorkThatDoesNotBelongToTheList()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var foreignWorkIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workIds[0]), user.Id, default);

            var request = new ReorderPersonalListWorksRequest(new[]
            {
                new PersonalListWorkPositionRequest(foreignWorkIds[0], 0)
            });

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => personalListService.ReorderWorksAsync(listId, request, user.Id, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, foreignWorkIds);
        }
    }

    [Fact]
    public async Task PersonalLists_CannotBeManagedByAnotherUser()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, users[0].Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => personalListService.RenameAsync(listId, new UpdatePersonalListRequest("Robada"), users[1].Id, default));

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => personalListService.DeleteAsync(listId, users[1].Id, default));

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => personalListService.GetSummaryAsync(listId, users[1].Id, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task SystemLists_CannotBeManagedThroughThePersonalEndpoints()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var systemListId = await PersonalListTestSupport.GetFirstSystemListIdAsync(_fixture);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(
            () => personalListService.RenameAsync(systemListId, new UpdatePersonalListRequest("Renombrada"), user.Id, default));

        await Assert.ThrowsAsync<BusinessNotFoundException>(
            () => personalListService.DeleteAsync(systemListId, user.Id, default));
    }

    [Fact]
    public async Task CatalogLists_WithMyListsTrue_ReturnsOnlyThePersonalListsOfTheUser()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, users[0].Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workListService = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var personal = await workListService.GetCatalogPagedAsync(
                new GetCatalogListsRequest(myLists: "true"),
                users[0].Id,
                default);

            Assert.Equal(1, personal.TotalCount);
            Assert.Equal(listId, Assert.Single(personal.Items).Id);
            Assert.Null(Assert.Single(personal.Items).ListTypeId);

            var otherUser = await workListService.GetCatalogPagedAsync(
                new GetCatalogListsRequest(myLists: "true"),
                users[1].Id,
                default);

            Assert.DoesNotContain(otherUser.Items, item => item.Id == listId);
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task CatalogLists_WithoutMyLists_KeepsReturningOnlyTheSystemLists()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);
            var systemListCount = await PersonalListTestSupport.CountSystemListsAsync(_fixture);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workListService = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            foreach (var myLists in new[] { null, "false", "not-a-boolean", "" })
            {
                var response = await workListService.GetCatalogPagedAsync(
                    new GetCatalogListsRequest(myLists: myLists),
                    user.Id,
                    default);

                Assert.Equal(systemListCount, response.TotalCount);
                Assert.DoesNotContain(response.Items, item => item.Id == listId);
            }
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }

    [Fact]
    public async Task CatalogListDetail_IsAvailableForTheOwnerOfAPersonalList()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, users[0].Id);

            using (var addWorkScope = _fixture.ScopeFactory.CreateScope())
            {
                var personalListService = addWorkScope.ServiceProvider.GetRequiredService<IPersonalListService>();
                await personalListService.AddWorkAsync(listId, new AddWorkToPersonalListRequest(workIds[0]), users[0].Id, default);
            }

            using var scope = _fixture.ScopeFactory.CreateScope();
            var workListService = scope.ServiceProvider.GetRequiredService<IWorkListService>();

            var detail = await workListService.GetCatalogByIdAsync(listId, users[0].Id, default);
            Assert.Equal(listId, detail.Id);
            Assert.Equal(1, detail.WorkCount);
            Assert.Null(detail.ListTypeId);

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => workListService.GetCatalogByIdAsync(listId, users[1].Id, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
            await FavoriteTestSupport.CleanupAsync(_fixture, users[0].Id, workIds);
        }
    }

    [Fact]
    public async Task PersonalLists_CannotBeRated()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var listId = 0L;

        try
        {
            listId = await PersonalListTestSupport.CreatePersonalListAsync(_fixture, user.Id);

            using var scope = _fixture.ScopeFactory.CreateScope();
            var listRatingService = scope.ServiceProvider.GetRequiredService<IListRatingService>();

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => listRatingService.CreateOrUpdateAsync(listId, user.Id, 5, null, default));
        }
        finally
        {
            await PersonalListTestSupport.CleanupAsync(_fixture, listId);
        }
    }
}
