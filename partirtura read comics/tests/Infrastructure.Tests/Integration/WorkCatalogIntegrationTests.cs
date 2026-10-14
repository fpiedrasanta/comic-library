using System.Globalization;
using System.Text;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkCatalogIntegrationTests
{
    private const int PageSize = 50;
    private const int MaxPages = 40;

    private readonly IntegrationTestFixture _fixture;

    public WorkCatalogIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Catalog_WithoutFilters_ReturnsWorksWithWorkType()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var response = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(pageSize: PageSize), null, default);

        Assert.NotEmpty(response.Items);
        Assert.All(response.Items, item => Assert.True(item.WorkTypeId.HasValue == !string.IsNullOrEmpty(item.WorkTypeName)));
        Assert.Contains(response.Items, item => item.WorkTypeId.HasValue);
        Assert.True(response.TotalCount >= response.Items.Count);
    }

    [Fact]
    public async Task Catalog_DefaultOrder_IsCreatedAtDescending()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var items = await GetAllItemsAsync(workService);

        Assert.True(items.Count > 1, "The catalog needs at least two works to validate the default order.");
        AssertCreatedAtOrder(items, descending: true);
    }

    [Fact]
    public async Task Catalog_DoesNotReturnInactiveWorks()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var inactive = await workService.GetPagedAsync(new GetWorksRequest(currentPage: 1, pageSize: PageSize, isActive: false), default);
        var active = await GetAllItemsAsync(workService);

        var inactiveIds = inactive.Items.Select(item => item.Id).ToHashSet();
        Assert.DoesNotContain(active, item => inactiveIds.Contains(item.Id));
    }

    [Fact]
    public async Task Search_ByTitle_IsPartialAndCaseInsensitive()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var candidate = all.FirstOrDefault(item => item.Title.Length >= 3);
        Assert.NotNull(candidate);

        var fragment = candidate.Title.Substring(1, candidate.Title.Length - 2).ToLowerInvariant();
        var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(search: fragment, pageSize: PageSize), null, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Search_ByDescription_IsPartial()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var candidate = all.FirstOrDefault(item => !string.IsNullOrWhiteSpace(item.Description) && item.Description!.Length >= 3);
        Assert.NotNull(candidate);

        var fragment = candidate.Description!.Substring(1, 2).ToLowerInvariant();
        var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(search: fragment, pageSize: PageSize), null, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Search_ByNumberValue_IsPartial()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var candidate = all.FirstOrDefault(item => !string.IsNullOrWhiteSpace(item.NumberValue) && item.NumberValue!.Length >= 3);
        Assert.NotNull(candidate);

        var fragment = candidate.NumberValue!.Substring(1, 2);
        var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(search: fragment, pageSize: PageSize), null, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Search_ByTag_ReturnsTheTaggedWork()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var all = await GetAllItemsAsync(workService);
        var tagged = await FindTaggedWorkAsync(unitOfWork, all);
        Assert.True(tagged.HasValue);

        var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(search: tagged.Value.TagName, pageSize: PageSize), null, default);

        Assert.Contains(result.Items, item => item.Id == tagged.Value.WorkId);
    }

    [Fact]
    public async Task Search_ByPerson_ReturnsTheWorkRegardlessOfRole()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var all = await GetAllItemsAsync(workService);
        var credited = await FindCreditedWorkAsync(unitOfWork, all);
        Assert.True(credited.HasValue);

        var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(search: credited.Value.PersonName, pageSize: PageSize), null, default);

        Assert.Contains(result.Items, item => item.Id == credited.Value.WorkId);
    }

    [Fact]
    public async Task Filter_ByPublisher_ReturnsDirectFranchiseAndSeriesWorks()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var publisherService = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var all = await GetAllItemsAsync(workService);
        var publishers = await publisherService.GetPagedAsync(new GetPublishersRequest { currentPage = 1, pageSize = PageSize }, default);

        foreach (var publisher in publishers.Items)
        {
            var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(publisherId: publisher.Id, pageSize: PageSize), null, default);
            var expected = all.Where(item => item.Publisher?.Id == publisher.Id).Select(item => item.Id).ToHashSet();

            Assert.Equal(expected.OrderBy(id => id), result.Items.Select(item => item.Id).OrderBy(id => id));
        }
    }

    [Fact]
    public async Task Filter_ByFranchise_ReturnsDirectAndSeriesWorks()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var franchiseIds = all.Select(item => item.Franchise?.Id).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        Assert.NotEmpty(franchiseIds);

        foreach (var franchiseId in franchiseIds)
        {
            var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(franchiseId: franchiseId, pageSize: PageSize), null, default);
            var expected = all.Where(item => item.Franchise?.Id == franchiseId).Select(item => item.Id).ToHashSet();

            Assert.Equal(expected.OrderBy(id => id), result.Items.Select(item => item.Id).OrderBy(id => id));
        }
    }

    [Fact]
    public async Task Filter_BySeries_ReturnsOnlyThatSeries()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var seriesIds = all.Select(item => item.Series?.Id).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        Assert.NotEmpty(seriesIds);

        foreach (var seriesId in seriesIds)
        {
            var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(seriesId: seriesId, pageSize: PageSize), null, default);

            Assert.NotEmpty(result.Items);
            Assert.All(result.Items, item => Assert.Equal(seriesId, item.Series?.Id));
        }
    }

    [Fact]
    public async Task Filter_Combined_AppliesEveryConstraint()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var candidate = all.FirstOrDefault(item => item.Series != null && item.Franchise != null && item.Publisher != null);
        Assert.NotNull(candidate);

        var result = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(
            search: candidate.Title.Substring(0, Math.Min(3, candidate.Title.Length)),
            publisherId: candidate.Publisher!.Id,
            franchiseId: candidate.Franchise!.Id,
            seriesId: candidate.Series!.Id,
            pageSize: PageSize), null, default);

        Assert.Contains(result.Items, item => item.Id == candidate.Id);
        Assert.All(result.Items, item => Assert.Equal(candidate.Series!.Id, item.Series?.Id));
    }

    [Fact]
    public async Task Filter_ByWorkType_KeepsHierarchyUnchanged()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var candidate = all.FirstOrDefault(item => item.WorkTypeId.HasValue && item.Publisher != null);
        Assert.NotNull(candidate);

        var byType = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(workTypeId: candidate.WorkTypeId, pageSize: PageSize), null, default);
        var byHierarchy = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(publisherId: candidate.Publisher!.Id, pageSize: PageSize), null, default);

        Assert.All(byType.Items, item => Assert.Equal(candidate.WorkTypeId, item.WorkTypeId));
        Assert.Contains(byType.Items, item => item.Id == candidate.Id);
        Assert.Contains(byHierarchy.Items, item => item.Id == candidate.Id);
    }

    [Fact]
    public async Task Order_SupportsEverySortFieldAndDirection()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        Assert.True(all.Count > 1, "The catalog needs at least two works to validate ordering.");

        var titleAsc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.Title, orderDir: SortDirection.ASC));
        var titleDesc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.Title, orderDir: SortDirection.DESC));
        AssertInverseOrder(titleAsc, titleDesc);

        var dateAsc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.PublicationDate, orderDir: SortDirection.ASC));
        var dateDesc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.PublicationDate, orderDir: SortDirection.DESC));
        AssertDateOrder(dateAsc, dateDesc, item => item.PublicationDate);

        var uploadedAsc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.UploadedAt, orderDir: SortDirection.ASC));
        var uploadedDesc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.UploadedAt, orderDir: SortDirection.DESC));
        AssertDateOrder(uploadedAsc, uploadedDesc, item => item.CreatedAt);

        var numberAsc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.Number, orderDir: SortDirection.ASC));
        var numberDesc = await GetAllItemsAsync(workService, new GetCatalogWorksRequest(orderBy: WorkCatalogSortFields.Number, orderDir: SortDirection.DESC));
        AssertNumberOrder(numberAsc, numberDesc);
    }

    [Fact]
    public async Task Pagination_ReturnsSequentialPagesWithoutDuplicates()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var first = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(currentPage: 1, pageSize: 5), null, default);
        Assert.NotEmpty(first.Items);
        Assert.True(first.HasNextPage);

        var second = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(currentPage: 2, pageSize: 5), null, default);
        Assert.True(second.HasPriorPage);
        Assert.Empty(first.Items.Select(item => item.Id).Intersect(second.Items.Select(item => item.Id)));

        var beyondLast = await workService.GetCatalogPagedAsync(new GetCatalogWorksRequest(currentPage: first.TotalPages + 5, pageSize: 5), null, default);
        Assert.Empty(beyondLast.Items);
        Assert.Equal(first.TotalCount, beyondLast.TotalCount);
    }

    [Fact]
    public async Task Pagination_CombinesWithSearchAndHierarchyFilters()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var all = await GetAllItemsAsync(workService);
        var candidate = all.FirstOrDefault(item => item.Publisher != null && item.Title.Length >= 3);
        Assert.NotNull(candidate);

        var request = new GetCatalogWorksRequest(
            search: candidate.Title.Substring(0, 3),
            publisherId: candidate.Publisher!.Id,
            pageSize: 1);

        var firstPage = await workService.GetCatalogPagedAsync(request with { currentPage = 1 }, null, default);
        var secondPage = await workService.GetCatalogPagedAsync(request with { currentPage = 2 }, null, default);

        Assert.NotEmpty(firstPage.Items);
        Assert.Empty(firstPage.Items.Select(item => item.Id).Intersect(secondPage.Items.Select(item => item.Id)));
        Assert.All(firstPage.Items, item => Assert.Equal(candidate.Publisher!.Id, item.Publisher?.Id));
    }

    private async Task<List<WorkCatalogItemDto>> GetAllItemsAsync(IWorkService workService, GetCatalogWorksRequest? request = null)
    {
        var items = new List<WorkCatalogItemDto>();
        var currentPage = 1;
        ListResponse<WorkCatalogItemDto> response;

        do
        {
            var paged = (request ?? new GetCatalogWorksRequest()) with { currentPage = currentPage, pageSize = PageSize };
            response = await workService.GetCatalogPagedAsync(paged, default);
            items.AddRange(response.Items);
            currentPage++;
        }
        while (response.HasNextPage && currentPage <= MaxPages);

        return items;
    }

    private static async Task<(long WorkId, string TagName)?> FindTaggedWorkAsync(IUnitOfWork unitOfWork, List<WorkCatalogItemDto> items)
    {
        foreach (var item in items)
        {
            var work = await unitOfWork.WorkRepository.GetByIdAsync(item.Id, default);
            var tag = work?.Tags.FirstOrDefault()?.Tag;
            if (tag is not null && tag.Name.Length >= 2)
            {
                return (item.Id, tag.Name.Substring(0, Math.Min(3, tag.Name.Length)));
            }
        }

        return null;
    }

    private static async Task<(long WorkId, string PersonName)?> FindCreditedWorkAsync(IUnitOfWork unitOfWork, List<WorkCatalogItemDto> items)
    {
        foreach (var item in items)
        {
            var work = await unitOfWork.WorkRepository.GetByIdAsync(item.Id, default);
            var person = work?.PersonByRoles.FirstOrDefault()?.Person;
            if (person is not null && person.Name.Length >= 2)
            {
                return (item.Id, person.Name.Substring(0, Math.Min(3, person.Name.Length)));
            }
        }

        return null;
    }

    private static void AssertCreatedAtOrder(List<WorkCatalogItemDto> items, bool descending)
    {
        var sorted = (descending
            ? items.OrderByDescending(item => item.CreatedAt)
            : items.OrderBy(item => item.CreatedAt))
            .ThenBy(item => item.Id)
            .Select(item => item.Id);

        Assert.Equal(sorted, items.Select(item => item.Id));
    }

    private static void AssertTextOrder(List<WorkCatalogItemDto> ascending, List<WorkCatalogItemDto> descending, Func<WorkCatalogItemDto, string> selector)
    {
        var expectedAscending = ascending.OrderBy(item => selector(item), StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id).Select(item => item.Id);
        var expectedDescending = descending.OrderByDescending(item => selector(item), StringComparer.OrdinalIgnoreCase).ThenBy(item => item.Id).Select(item => item.Id);

        Assert.Equal(expectedAscending, ascending.Select(item => item.Id));
        Assert.Equal(expectedDescending, descending.Select(item => item.Id));
    }

    private static void AssertInverseOrder(List<WorkCatalogItemDto> ascending, List<WorkCatalogItemDto> descending)
    {
        var ascIds = ascending.Select(item => item.Id).OrderBy(id => id).ToList();
        var descIds = descending.Select(item => item.Id).OrderBy(id => id).ToList();

        Assert.Equal(ascIds, descIds);
    }

    private static string ToSortKey(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var decomposed = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);

        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(char.ToLowerInvariant(character));
            }
        }

        return builder.ToString();
    }

    private static void AssertDateOrder(List<WorkCatalogItemDto> ascending, List<WorkCatalogItemDto> descending, Func<WorkCatalogItemDto, DateTime?> selector)
    {
        var expectedAscending = ascending.OrderBy(item => selector(item)).ThenBy(item => item.Id).Select(item => item.Id);
        var expectedDescending = descending.OrderByDescending(item => selector(item)).ThenBy(item => item.Id).Select(item => item.Id);

        Assert.Equal(expectedAscending, ascending.Select(item => item.Id));
        Assert.Equal(expectedDescending, descending.Select(item => item.Id));
    }

    private static void AssertNumberOrder(List<WorkCatalogItemDto> ascending, List<WorkCatalogItemDto> descending)
    {
        var expectedAscending = ascending.OrderBy(item => ToSortKey(item.NumberValue), StringComparer.Ordinal).ThenBy(item => item.Id).Select(item => item.Id);
        var expectedDescending = descending.OrderByDescending(item => ToSortKey(item.NumberValue), StringComparer.Ordinal).ThenBy(item => item.Id).Select(item => item.Id);

        Assert.Equal(expectedAscending, ascending.Select(item => item.Id));
        Assert.Equal(expectedDescending, descending.Select(item => item.Id));
    }
}
