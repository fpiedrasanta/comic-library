using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class CatalogListingIntegrationTests
{
    private const int PageSize = 24;
    private const int SmallPageSize = 2;

    private readonly IntegrationTestFixture _fixture;

    public CatalogListingIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Publishers_ReturnOnlyActiveOnes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IPublisherService>();
        var admin = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var catalogItems = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest { currentPage = page, pageSize = PageSize }, default));
        var inactive = await admin.GetPagedAsync(new GetPublishersRequest { currentPage = 1, pageSize = PageSize, IsActive = false }, default);

        Assert.NotEmpty(catalogItems);
        Assert.DoesNotContain(catalogItems, item => inactive.Items.Any(other => other.Id == item.Id));
    }

    [Fact]
    public async Task Franchises_ReturnOnlyActiveOnesWhosePublisherIsActive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var admin = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var catalogItems = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var inactiveFranchises = await admin.GetPagedAsync(new GetFranchisesRequest { currentPage = 1, pageSize = PageSize, IsActive = false }, default);
        var inactivePublishers = await publishers.GetPagedAsync(new GetPublishersRequest { currentPage = 1, pageSize = PageSize, IsActive = false }, default);

        Assert.NotEmpty(catalogItems);
        Assert.DoesNotContain(catalogItems, item => inactiveFranchises.Items.Any(other => other.Id == item.Id));
        Assert.DoesNotContain(catalogItems, item => inactivePublishers.Items.Any(other => other.Id == item.Publisher.Id));
    }

    [Fact]
    public async Task Series_ReturnOnlyActiveOnesWhoseFranchiseAndPublisherAreActive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var admin = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var catalogItems = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var inactiveSeries = await admin.GetPagedAsync(new GetSeriesRequest { currentPage = 1, pageSize = PageSize, IsActive = false }, default);
        var inactivePublishers = await publishers.GetPagedAsync(new GetPublishersRequest { currentPage = 1, pageSize = PageSize, IsActive = false }, default);

        Assert.NotEmpty(catalogItems);
        Assert.DoesNotContain(catalogItems, item => inactiveSeries.Items.Any(other => other.Id == item.Id));
        Assert.DoesNotContain(catalogItems, item => inactivePublishers.Items.Any(other => other.Id == item.Publisher.Id));
        Assert.All(catalogItems, item => Assert.True(item.Franchise.Id > 0));
    }

    [Fact]
    public async Task Publishers_AreOrderedByNameAscending()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var items = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.Equal(items.OrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id), items);
    }

    [Fact]
    public async Task Franchises_AreOrderedByNameAscending()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var items = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.Equal(items.OrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id), items);
    }

    [Fact]
    public async Task Series_AreOrderedByNameAscending()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var items = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.Equal(items.OrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id), items);
    }

    [Fact]
    public async Task Publishers_SearchByName_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var all = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = all.First(item => item.Name.Length >= 3);

        var result = await catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest { search = candidate.Name.Substring(1, 2).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Franchises_SearchMatchesFranchiseNameOrPublisherName()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var all = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = all.First(item => item.Name.Length >= 3);

        var byFranchise = await catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { search = candidate.Name.Substring(0, 3).ToLowerInvariant(), pageSize = PageSize }, default);
        var byPublisher = await catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { search = candidate.Publisher.Name.Substring(0, 3).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(byFranchise.Items, item => item.Id == candidate.Id);
        Assert.Contains(byPublisher.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Series_SearchMatchesSeriesFranchiseOrPublisherName()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = all.First(item => item.Name.Length >= 3 && item.Franchise.Name.Length >= 3 && item.Publisher.Name.Length >= 3);

        var bySeries = await catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { search = candidate.Name.Substring(0, 3).ToLowerInvariant(), pageSize = PageSize }, default);
        var byFranchise = await catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { search = candidate.Franchise.Name.Substring(0, 3).ToLowerInvariant(), pageSize = PageSize }, default);
        var byPublisher = await catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { search = candidate.Publisher.Name.Substring(0, 3).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(bySeries.Items, item => item.Id == candidate.Id);
        Assert.Contains(byFranchise.Items, item => item.Id == candidate.Id);
        Assert.Contains(byPublisher.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task FranchiseCards_ExposePublisherNodeForThePill()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var items = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.All(items, item =>
        {
            Assert.True(item.Publisher.Id > 0);
            Assert.False(string.IsNullOrWhiteSpace(item.Publisher.Name));
        });
    }

    [Fact]
    public async Task SeriesCards_ExposeFranchiseAndPublisherNodesForThePills()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var items = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.All(items, item =>
        {
            Assert.True(item.Franchise.Id > 0);
            Assert.False(string.IsNullOrWhiteSpace(item.Franchise.Name));
            Assert.True(item.Publisher.Id > 0);
            Assert.False(string.IsNullOrWhiteSpace(item.Publisher.Name));
        });
    }

    [Fact]
    public async Task Cards_ExposeImageUrlOnlyWhenAnImageExists()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var publisherCards = await GetAllAsync(page => publishers.GetCatalogPagedAsync(new GetCatalogPublishersRequest { currentPage = page, pageSize = PageSize }, default));
        var franchiseCards = await GetAllAsync(page => franchises.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var seriesCards = await GetAllAsync(page => series.GetCatalogPagedAsync(new GetCatalogSeriesRequest { currentPage = page, pageSize = PageSize }, default));

        foreach (var card in publisherCards)
        {
            var entity = await unitOfWork.PublisherRepository.GetByIdAsync(card.Id, default);
            Assert.Equal(entity!.Image is null ? null : $"/images/{entity.Image.Id}", card.UrlImage);
        }

        foreach (var card in franchiseCards)
        {
            var entity = await unitOfWork.FranchiseRepository.GetDetailByIdAsync(card.Id, default);
            Assert.Equal(entity!.Image is null ? null : $"/images/{entity.Image.Id}", card.UrlImage);
        }

        foreach (var card in seriesCards)
        {
            var entity = await unitOfWork.SeriesRepository.GetDetailByIdAsync(card.Id, default);
            Assert.Equal(entity!.Image is null ? null : $"/images/{entity.Image.Id}", card.UrlImage);
        }
    }

    [Fact]
    public async Task Pagination_IsStableWithoutDuplicatesAcrossPages()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var items = await GetAllAsync(page => catalog.GetCatalogPagedAsync(new GetCatalogSeriesRequest { currentPage = page, pageSize = SmallPageSize }, default));

        Assert.True(items.Count > SmallPageSize);
        Assert.Equal(items.Count, items.Select(item => item.Id).Distinct().Count());
    }

    [Fact]
    public async Task Pagination_ReportsCorrectNavigationFlags()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var first = await catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = 1, pageSize = SmallPageSize }, default);
        var beyondLast = await catalog.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { currentPage = first.TotalPages + 5, pageSize = SmallPageSize }, default);

        Assert.True(first.HasNextPage);
        Assert.False(first.HasPriorPage);
        Assert.Empty(beyondLast.Items);
        Assert.Equal(first.TotalCount, beyondLast.TotalCount);
    }

    [Fact]
    public async Task PageSize_IsCappedAndDefaultsToTwentyFour()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var catalog = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var capped = await catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest { pageSize = 100 }, default);
        var byDefault = await catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest(), default);
        var normalized = await catalog.GetCatalogPagedAsync(new GetCatalogPublishersRequest { currentPage = 0, pageSize = -5 }, default);

        Assert.Equal(PaginationGuard.CatalogCardMaxPageSize, capped.PageSize);
        Assert.Equal(PaginationGuard.CatalogCardDefaultPageSize, byDefault.PageSize);
        Assert.Equal(24, byDefault.PageSize);
        Assert.Equal(1, normalized.CurrentPage);
        Assert.Equal(PaginationGuard.CatalogCardDefaultPageSize, normalized.PageSize);
    }

    [Fact]
    public async Task SearchWithNoMatches_ReturnsEmptyListWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        const string term = "no-existe-este-texto-12345";

        var publisherResult = await publishers.GetCatalogPagedAsync(new GetCatalogPublishersRequest { search = term }, default);
        var franchiseResult = await franchises.GetCatalogPagedAsync(new GetCatalogFranchisesRequest { search = term }, default);
        var seriesResult = await series.GetCatalogPagedAsync(new GetCatalogSeriesRequest { search = term }, default);

        Assert.Empty(publisherResult.Items);
        Assert.Empty(franchiseResult.Items);
        Assert.Empty(seriesResult.Items);
        Assert.Equal(0, publisherResult.TotalCount);
        Assert.Equal(0, franchiseResult.TotalCount);
        Assert.Equal(0, seriesResult.TotalCount);
    }

    private static async Task<List<TItem>> GetAllAsync<TItem>(Func<int, Task<ListResponse<TItem>>> pageFactory)
    {
        var items = new List<TItem>();
        var currentPage = 1;
        ListResponse<TItem> response;

        do
        {
            response = await pageFactory(currentPage);
            items.AddRange(response.Items);
            currentPage++;
        }
        while (response.HasNextPage);

        return items;
    }
}