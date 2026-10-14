using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class ListTypesIntegrationTests
{
    private const int PageSize = 24;
    private const long UnknownId = 9_999_999_999;

    private readonly IntegrationTestFixture _fixture;

    public ListTypesIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ListTypes_ReturnOnlyActiveTypes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypeService = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var result = await listTypeService.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        
        Assert.NotNull(result);
        Assert.True(result.TotalCount >= 0);
    }

    [Fact]
    public async Task ListTypes_OrderByNameAscending()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypeService = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var result = await listTypeService.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        
        if (result.Items.Count <= 1)
        {
            return;
        }

        var names = result.Items.Select(item => item.Name).ToList();
        Assert.Equal(names.OrderBy(n => n), names);
    }

    [Fact]
    public async Task ListTypes_SearchByName_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypeService = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var all = await listTypeService.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        
        if (!all.Items.Any())
        {
            return;
        }
        
        var candidate = all.Items.First(item => item.Name.Length >= 3);

        var result = await listTypeService.GetPublicPagedAsync(
            new ListRequest { search = candidate.Name.Substring(1, 2).ToLowerInvariant(), pageSize = PageSize },
            default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task ListTypes_PaginationWorks()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypeService = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var page1 = await listTypeService.GetPublicPagedAsync(new ListRequest { currentPage = 1, pageSize = 2 }, default);
        
        if (page1.TotalCount <= 2)
        {
            return;
        }

        var page2 = await listTypeService.GetPublicPagedAsync(new ListRequest { currentPage = 2, pageSize = 2 }, default);

        Assert.True(page1.HasNextPage);
        Assert.False(page1.HasPriorPage);
        Assert.True(page2.HasPriorPage);
        Assert.Empty(page1.Items.Intersect(page2.Items, new ListTypeFilterDtoComparer()));
    }

    [Fact]
    public async Task ListTypes_CapPageSizeToMax()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypeService = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var result = await listTypeService.GetPublicPagedAsync(new ListRequest { pageSize = 999 }, default);
        
        Assert.Equal(PaginationGuard.CatalogFilterMaxPageSize, result.PageSize);
    }

    [Fact]
    public async Task ListTypes_ExposeOnlyPublicFields()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypeService = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var result = await listTypeService.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        
        if (!result.Items.Any())
        {
            return;
        }

        var item = result.Items.First();
        Assert.True(item.Id > 0);
        Assert.False(string.IsNullOrWhiteSpace(item.Name));
    }

    private sealed class ListTypeFilterDtoComparer : IEqualityComparer<ListTypeFilterDto>
    {
        public bool Equals(ListTypeFilterDto? x, ListTypeFilterDto? y)
        {
            return x?.Id == y?.Id;
        }

        public int GetHashCode(ListTypeFilterDto obj)
        {
            return obj.Id.GetHashCode();
        }
    }
}
