using Application.DTOs;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class CatalogListsWorkCountIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public CatalogListsWorkCountIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetCatalogPaged_ReturnsWorkCountOfEachList()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var result = await service.GetCatalogPagedAsync(new GetCatalogListsRequest { pageSize = 24 }, default);

        Assert.NotEmpty(result.Items);

        var listIds = result.Items.Select(item => item.Id).ToList();
        var expectedCounts = await dbContext.WorkListItems
            .AsNoTracking()
            .Where(item => item.WorkList != null && listIds.Contains(item.WorkList.Id))
            .GroupBy(item => item.WorkList!.Id)
            .Select(group => new { WorkListId = group.Key, Count = group.Count() })
            .ToListAsync(default);

        foreach (var item in result.Items)
        {
            var expected = expectedCounts.FirstOrDefault(entry => entry.WorkListId == item.Id)?.Count ?? 0;

            Assert.Equal(expected, item.WorkCount);
        }

        Assert.Empty(dbContext.ChangeTracker.Entries<Domain.Entities.WorkList>());
        Assert.Empty(dbContext.ChangeTracker.Entries<Domain.Entities.WorkListItem>());
    }

    [Fact]
    public async Task GetCatalogPaged_DoesNotLoadWorkListItemsOfEveryList()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var result = await service.GetCatalogPagedAsync(new GetCatalogListsRequest { pageSize = 24 }, default);

        var listIds = result.Items.Select(item => item.Id).ToList();

        Assert.Empty(dbContext.ChangeTracker.Entries<Domain.Entities.WorkListItem>());
    }

    [Fact]
    public async Task GetCatalogById_ReturnsWorkCountOfTheList()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkListService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var cards = await service.GetCatalogPagedAsync(new GetCatalogListsRequest { pageSize = 24 }, default);
        var candidate = cards.Items[0];

        var detail = await service.GetCatalogByIdAsync(candidate.Id, default);

        Assert.Equal(candidate.WorkCount, detail.WorkCount);
    }
}
