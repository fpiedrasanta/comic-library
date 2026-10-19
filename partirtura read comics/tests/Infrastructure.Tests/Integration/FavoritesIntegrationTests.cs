using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class FavoritesIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public FavoritesIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task AddFavorite_CreatesTheRecordForTheAuthenticatedUser()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            var favorites = await FavoriteTestSupport.GetFavoriteWorkIdsAsync(_fixture, user.Id);
            Assert.Contains(workIds[0], favorites);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task AddFavorite_RejectsDuplicates()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            await Assert.ThrowsAsync<BusinessConflictException>(
                () => favoriteService.AddFavoriteAsync(workIds[0], user.Id, default));

            var count = await FavoriteTestSupport.CountFavoritesAsync(_fixture, user.Id, workIds[0]);
            Assert.Equal(1, count);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task AddFavorite_RejectsUnknownWork()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];

        using var scope = _fixture.ScopeFactory.CreateScope();
        var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(
            () => favoriteService.AddFavoriteAsync(long.MaxValue, user.Id, default));
    }

    [Fact]
    public async Task RemoveFavorite_DeletesTheRecordPhysically()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);
            await favoriteService.RemoveFavoriteAsync(workIds[0], user.Id, default);

            var count = await FavoriteTestSupport.CountFavoritesAsync(_fixture, user.Id, workIds[0]);
            Assert.Equal(0, count);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task RemoveFavorite_RejectsFavoriteThatDoesNotExist()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();

            await Assert.ThrowsAsync<BusinessNotFoundException>(
                () => favoriteService.RemoveFavoriteAsync(workIds[0], user.Id, default));
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Favorites_AreIsolatedBetweenUsers()
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, users[0].Id);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, users[1].Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();

            await favoriteService.AddFavoriteAsync(workIds[0], users[0].Id, default);

            var firstUserFavorites = await FavoriteTestSupport.GetFavoriteWorkIdsAsync(_fixture, users[0].Id);
            var secondUserFavorites = await FavoriteTestSupport.GetFavoriteWorkIdsAsync(_fixture, users[1].Id);

            Assert.Contains(workIds[0], firstUserFavorites);
            Assert.DoesNotContain(workIds[0], secondUserFavorites);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, users[0].Id, workIds);
            await FavoriteTestSupport.CleanupAsync(_fixture, users[1].Id, workIds);
        }
    }

    [Fact]
    public async Task AddFavorite_DoesNotChangeReadingProgressOrRatings()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using (var setupScope = _fixture.ScopeFactory.CreateScope())
            {
                var workService = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
                var before = await workService.GetCatalogByIdAsync(workIds[0], user.Id, default);
                Assert.NotNull(before);

                using var favoriteScope = _fixture.ScopeFactory.CreateScope();
                var favoriteService = favoriteScope.ServiceProvider.GetRequiredService<IFavoriteService>();
                await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

                var after = await workService.GetCatalogByIdAsync(workIds[0], user.Id, default);
                Assert.NotNull(after);
                Assert.Equal(before!.MyReadingProgress, after!.MyReadingProgress);
                Assert.Equal(before.AverageRating, after.AverageRating);
                Assert.Equal(before.RatingCount, after.RatingCount);
            }
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_WithIsFavoriteTrue_ReturnsOnlyTheFavoritesOfTheUser()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 2);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            var response = await workService.GetCatalogPagedAsync(
                new GetCatalogWorksRequest(pageSize: 50, isFavorite: true),
                user.Id,
                default);

            Assert.Equal(1, response.TotalCount);
            var item = Assert.Single(response.Items);
            Assert.Equal(workIds[0], item.Id);
            Assert.True(item.IsFavorite);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_WithIsFavoriteFalseOrNull_DoesNotFilterTheCatalog()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 2);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            var withoutFilter = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), user.Id, default);
            var explicitFalse = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50, isFavorite: false), user.Id, default);

            Assert.Equal(withoutFilter.TotalCount, explicitFalse.TotalCount);

            var favorited = withoutFilter.Items.FirstOrDefault(item => item.Id == workIds[0]);
            Assert.NotNull(favorited);
            Assert.True(favorited!.IsFavorite);

            var notFavorited = withoutFilter.Items.FirstOrDefault(item => item.Id == workIds[1]);
            Assert.NotNull(notFavorited);
            Assert.False(notFavorited!.IsFavorite);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task Catalog_IsFavoriteFilter_IsAppliedBeforeCountingAndPaginating()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 2);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();
            var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            var unfiltered = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50), user.Id, default);
            var filtered = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: 50, isFavorite: true), user.Id, default);

            Assert.True(unfiltered.TotalCount > filtered.TotalCount);
            Assert.Equal(1, filtered.TotalCount);
            Assert.Equal(1, filtered.TotalPages);
            Assert.False(filtered.HasNextPage);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task ReadingHistory_ExposesTheFavoriteStateOfEveryWork()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();
            var historyService = scope.ServiceProvider.GetRequiredService<IReadingHistoryService>();

            await WorkListTestSupport.SetProgressAsync(_fixture, user.Id, workIds[0], ReadingState.Reading, 10);
            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            var history = await historyService.GetPagedAsync(new GetReadingHistoryRequest(pageSize: 50), user.Id, default);

            var item = history.Items.FirstOrDefault(entry => entry.Id == workIds[0]);
            Assert.NotNull(item);
            Assert.True(item!.IsFavorite);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }

    [Fact]
    public async Task RecommendedWorks_ExposeTheFavoriteStateOfEveryWork()
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var workIds = await FavoriteTestSupport.CreateWorksAsync(_fixture, 1);
        await FavoriteTestSupport.ClearFavoritesAsync(_fixture, user.Id);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var favoriteService = scope.ServiceProvider.GetRequiredService<IFavoriteService>();
            var recommendedService = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            await favoriteService.AddFavoriteAsync(workIds[0], user.Id, default);

            var recommended = await recommendedService.GetRecommendedAsync(user.Id, RecommendedSortFields.RecentlyAdded, default);

            var item = recommended.FirstOrDefault(entry => entry.Id == workIds[0]);
            Assert.NotNull(item);
            Assert.True(item!.IsFavorite);
        }
        finally
        {
            await FavoriteTestSupport.CleanupAsync(_fixture, user.Id, workIds);
        }
    }
}
