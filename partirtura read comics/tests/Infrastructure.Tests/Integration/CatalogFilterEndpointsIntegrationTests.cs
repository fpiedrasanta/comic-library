using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class CatalogFilterEndpointsIntegrationTests
{
    private const int PageSize = 24;
    private const int SmallPageSize = 2;
    private const long UnknownId = 9_999_999_999;

    private readonly IntegrationTestFixture _fixture;

    public CatalogFilterEndpointsIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Publishers_ReturnOnlyActiveOnes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var active = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        var inactive = await publishers.GetPagedAsync(new GetPublishersRequest { IsActive = false, currentPage = 1, pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);
        Assert.DoesNotContain(active.Items, item => inactive.Items.Any(other => other.Id == item.Id));
    }

    [Fact]
    public async Task Franchises_ReturnOnlyActiveOnes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);
        var inactive = await franchises.GetPagedAsync(new GetFranchisesRequest { IsActive = false, currentPage = 1, pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);
        Assert.DoesNotContain(active.Items, item => inactive.Items.Any(other => other.Id == item.Id));
    }

    [Fact]
    public async Task Series_ReturnOnlyActiveOnes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);
        var inactive = await series.GetPagedAsync(new GetSeriesRequest { IsActive = false, currentPage = 1, pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);
        Assert.DoesNotContain(active.Items, item => inactive.Items.Any(other => other.Id == item.Id));
    }

    [Fact]
    public async Task WorkTypes_ReturnOnlyActiveOnes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workTypes = scope.ServiceProvider.GetRequiredService<IWorkTypeService>();

        var active = await workTypes.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        var inactive = await workTypes.GetPagedAsync(new GetWorkTypesRequest { isActive = false, currentPage = 1, pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);
        Assert.DoesNotContain(active.Items, item => inactive.Items.Any(other => other.Id == item.Id));
    }

    [Fact]
    public async Task Publishers_SearchByName_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var all = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        var candidate = all.Items.First(item => item.Name.Length >= 3);

        var result = await publishers.GetPublicPagedAsync(new ListRequest { search = candidate.Name.Substring(1, 2).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Franchises_SearchByName_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var all = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);
        var candidate = all.Items.First(item => item.Name.Length >= 3);

        var result = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { search = candidate.Name.Substring(1, 2).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Series_SearchByName_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);
        var candidate = all.Items.First(item => item.Name.Length >= 3);

        var result = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { search = candidate.Name.Substring(1, 2).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task WorkTypes_SearchByName_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workTypes = scope.ServiceProvider.GetRequiredService<IWorkTypeService>();

        var all = await workTypes.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        var candidate = all.Items.First(item => item.Name.Length >= 3);

        var result = await workTypes.GetPublicPagedAsync(new ListRequest { search = candidate.Name.Substring(1, 2).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Series_SearchAlsoMatchesFranchiseName()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);
        var candidate = all.Items.First(item => item.FranchiseName is not null && item.FranchiseName.Length >= 3);

        var result = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { search = candidate.FranchiseName!.Substring(0, 3).ToLowerInvariant(), pageSize = PageSize }, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Franchises_FilterByPublisher_ReturnsOnlyThatPublishersFranchises()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var all = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var publisherIds = all.Select(item => item.PublisherId).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();

        Assert.NotEmpty(publisherIds);

        foreach (var publisherId in publisherIds)
        {
            var filtered = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize, PublisherId = publisherId }, default));
            var expected = all.Where(item => item.PublisherId == publisherId).Select(item => item.Id);

            Assert.NotEmpty(filtered);
            Assert.Equal(expected.OrderBy(id => id), filtered.Select(item => item.Id).OrderBy(id => id));
            Assert.All(filtered, item => Assert.Equal(publisherId, item.PublisherId));
        }
    }

    [Fact]
    public async Task Franchises_FilterByPublisherCombinesWithSearch()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var all = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = all.First(item => item.PublisherId.HasValue && item.Name.Length >= 3);
        var fragment = candidate.Name.Substring(0, 3).ToLowerInvariant();

        var filtered = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize, PublisherId = candidate.PublisherId, search = fragment }, default));
        var expected = all.Where(item => item.PublisherId == candidate.PublisherId && item.Name.Contains(fragment, StringComparison.OrdinalIgnoreCase)).Select(item => item.Id);

        Assert.Contains(filtered, item => item.Id == candidate.Id);
        Assert.Equal(expected.OrderBy(id => id), filtered.Select(item => item.Id).OrderBy(id => id));
    }

    [Fact]
    public async Task Series_FilterByFranchise_ReturnsOnlyThatFranchisesSeries()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var franchiseIds = all.Select(item => item.FranchiseId).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();

        Assert.NotEmpty(franchiseIds);

        foreach (var franchiseId in franchiseIds)
        {
            var filtered = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize, FranchiseId = franchiseId }, default));
            var expected = all.Where(item => item.FranchiseId == franchiseId).Select(item => item.Id);

            Assert.NotEmpty(filtered);
            Assert.Equal(expected.OrderBy(id => id), filtered.Select(item => item.Id).OrderBy(id => id));
            Assert.All(filtered, item => Assert.Equal(franchiseId, item.FranchiseId));
        }
    }

    [Fact]
    public async Task Series_FilterByPublisher_ReturnsSeriesOfEveryFranchiseOfThatPublisher()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var allSeries = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var allFranchises = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));

        var candidate = allFranchises.First(item => item.PublisherId.HasValue && allSeries.Any(s => s.FranchiseId == item.Id));

        var filtered = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize, PublisherId = candidate.PublisherId }, default));
        var expected = allSeries.Where(item => allFranchises.Any(f => f.Id == item.FranchiseId && f.PublisherId == candidate.PublisherId)).Select(item => item.Id);

        Assert.NotEmpty(filtered);
        Assert.Equal(expected.OrderBy(id => id), filtered.Select(item => item.Id).OrderBy(id => id));
    }

    [Fact]
    public async Task Series_FilterByPublisherAndFranchise_RequiresBothToMatch()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var allFranchises = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = allFranchises.First(item => item.PublisherId.HasValue);

        var matching = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize, PublisherId = candidate.PublisherId, FranchiseId = candidate.Id }, default));
        var mismatchedFranchise = allFranchises.FirstOrDefault(item => item.PublisherId != candidate.PublisherId);
        var mismatched = mismatchedFranchise is null
            ? new List<SeriesFilterDto>()
            : await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize, PublisherId = candidate.PublisherId, FranchiseId = mismatchedFranchise.Id }, default));

        Assert.All(matching, item => Assert.Equal(candidate.Id, item.FranchiseId));
        Assert.Empty(mismatched);
    }

    [Fact]
    public async Task Series_HierarchicalFiltersCombineWithSearch()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = all.First(item => item.FranchiseId.HasValue && item.Name.Length >= 3);
        var fragment = candidate.Name.Substring(0, 3).ToLowerInvariant();

        var filtered = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize, FranchiseId = candidate.FranchiseId, search = fragment }, default));
        var expected = all.Where(item => item.FranchiseId == candidate.FranchiseId && item.Name.Contains(fragment, StringComparison.OrdinalIgnoreCase)).Select(item => item.Id);

        Assert.Contains(filtered, item => item.Id == candidate.Id);
        Assert.Equal(expected.OrderBy(id => id), filtered.Select(item => item.Id).OrderBy(id => id));
    }

    [Fact]
    public async Task HierarchicalFilters_UnknownIds_ReturnEmptyListWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var unknownFranchises = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize, PublisherId = UnknownId }, default);
        var unknownSeries = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize, PublisherId = UnknownId }, default);
        var unknownSeriesByFranchise = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize, FranchiseId = UnknownId }, default);

        Assert.Empty(unknownFranchises.Items);
        Assert.Empty(unknownSeries.Items);
        Assert.Empty(unknownSeriesByFranchise.Items);
        Assert.Equal(0, unknownFranchises.TotalCount);
        Assert.Equal(0, unknownSeries.TotalCount);
        Assert.Equal(0, unknownSeriesByFranchise.TotalCount);
    }

    [Fact]
    public async Task HierarchicalFilters_Omitted_KeepsPreviousBehavior()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var franchisesWithoutFilters = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));
        var franchisesWithNullFilters = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize, PublisherId = null }, default));
        var seriesWithoutFilters = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var seriesWithNullFilters = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize, PublisherId = null, FranchiseId = null }, default));

        Assert.Equal(
            franchisesWithoutFilters.Select(item => item.Id),
            franchisesWithNullFilters.Select(item => item.Id));
        Assert.Equal(
            seriesWithoutFilters.Select(item => item.Id),
            seriesWithNullFilters.Select(item => item.Id));
    }

    [Fact]
    public async Task Series_ExposePublisherResolvedThroughFranchise()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var allSeries = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var allFranchises = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.Contains(allSeries, item => item.PublisherId.HasValue && !string.IsNullOrEmpty(item.PublisherName));

        foreach (var item in allSeries)
        {
            var franchise = allFranchises.FirstOrDefault(f => f.Id == item.FranchiseId);

            Assert.Equal(franchise?.PublisherId, item.PublisherId);
            Assert.Equal(franchise?.PublisherName, item.PublisherName);
        }
    }

    [Fact]
    public async Task Series_WithoutFranchise_ReturnNullPublisher()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.All(all.Where(item => !item.FranchiseId.HasValue), item =>
        {
            Assert.Null(item.PublisherId);
            Assert.Null(item.PublisherName);
        });
    }

    [Fact]
    public async Task Series_ExposePublisherWhenCombiningFilters()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var all = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = page, pageSize = PageSize }, default));
        var candidate = all.First(item => item.PublisherId.HasValue && item.Name.Length >= 3);

        var filtered = await GetAllAsync(page => series.GetPublicPagedAsync(new GetPublicSeriesRequest
        {
            currentPage = page,
            pageSize = PageSize,
            FranchiseId = candidate.FranchiseId,
            PublisherId = candidate.PublisherId,
            search = candidate.Name.Substring(0, 3).ToLowerInvariant()
        }, default));

        Assert.Contains(filtered, item => item.Id == candidate.Id);
        Assert.All(filtered, item => Assert.Equal(candidate.PublisherId, item.PublisherId));
    }

    [Fact]
    public async Task Pagination_IsStableWithoutDuplicatesAcrossPages()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var all = await GetAllAsync(page => publishers.GetPublicPagedAsync(new ListRequest { currentPage = page, pageSize = SmallPageSize }, default));

        Assert.True(all.Count > SmallPageSize);
        Assert.Equal(all.Count, all.Select(item => item.Id).Distinct().Count());
        Assert.Equal(all.OrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id), all);
    }

    [Fact]
    public async Task Pagination_ReportsCorrectNavigationFlags()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var first = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = 1, pageSize = SmallPageSize }, default);
        var second = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = 2, pageSize = SmallPageSize }, default);
        var beyondLast = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { currentPage = first.TotalPages + 5, pageSize = SmallPageSize }, default);

        Assert.True(first.HasNextPage);
        Assert.False(first.HasPriorPage);
        Assert.True(second.HasPriorPage);
        Assert.Empty(beyondLast.Items);
        Assert.Equal(first.TotalCount, beyondLast.TotalCount);
    }

    [Fact]
    public async Task WorkTypes_SupportBothOrderDirectionsByName()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workTypes = scope.ServiceProvider.GetRequiredService<IWorkTypeService>();

        var ascending = await GetAllAsync(page => workTypes.GetPublicPagedAsync(new ListRequest { currentPage = page, pageSize = PageSize, orderBy = "Name", orderDir = SortDirection.ASC }, default));
        var descending = await GetAllAsync(page => workTypes.GetPublicPagedAsync(new ListRequest { currentPage = page, pageSize = PageSize, orderBy = "Name", orderDir = SortDirection.DESC }, default));

        Assert.True(ascending.Count > 1);
        Assert.Equal(ascending.OrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase), ascending);
        Assert.Equal(descending.OrderByDescending(item => item.Name, StringComparer.OrdinalIgnoreCase), descending);
    }

    [Fact]
    public async Task Franchises_DefaultOrderIsNameAscending()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var items = await GetAllAsync(page => franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { currentPage = page, pageSize = PageSize }, default));

        Assert.Equal(items.OrderBy(item => item.Name, StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id), items);
    }

    [Fact]
    public async Task PublicLists_CapPageSizeForAutocomplete()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var response = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = 100 }, default);

        Assert.Equal(PaginationGuard.CatalogFilterMaxPageSize, response.PageSize);
        Assert.True(response.Items.Count <= PaginationGuard.CatalogFilterMaxPageSize);
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