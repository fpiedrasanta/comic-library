using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkReaderPagesIntegrationTests
{
    private const long UnknownId = 9_999_999_999;
    private readonly IntegrationTestFixture _fixture;

    public WorkReaderPagesIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetReaderPages_ExistingWorkWithPages_ReturnsOrderedPagesWithProtectedUrls()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);
        Assert.NotNull(entity);

        var result = await works.GetReaderPagesAsync(candidate.Id, default);

        Assert.Equal(candidate.Id, result.WorkId);
        Assert.NotNull(result.Pages);

        var expectedPages = entity.Pages.OrderBy(p => p.Order).ToList();
        Assert.Equal(expectedPages.Count, result.Pages.Count);

        for (int i = 0; i < expectedPages.Count; i++)
        {
            var expectedPage = expectedPages[i];
            var actualPage = result.Pages[i];

            Assert.Equal(expectedPage.Id, actualPage.Id);
            Assert.Equal(expectedPage.Order, actualPage.Number);
            Assert.Equal(expectedPage.Image is not null ? $"/images/{expectedPage.Image.Id}" : string.Empty, actualPage.Url);
        }
    }

    [Fact]
    public async Task GetReaderPages_WorkWithoutPages_ReturnsEmptyCollection()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.FirstOrDefault(item => item.Id > 0);
        if (candidate is null)
        {
            return;
        }

        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);
        if (entity is null || entity.Pages.Count > 0)
        {
            return; // Skip test if work has pages
        }

        var result = await works.GetReaderPagesAsync(candidate.Id, default);

        Assert.Equal(candidate.Id, result.WorkId);
        Assert.NotNull(result.Pages);
        Assert.Empty(result.Pages);
    }

    [Fact]
    public async Task GetReaderPages_UnknownWork_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => works.GetReaderPagesAsync(UnknownId, default));
    }

    [Fact]
    public async Task GetReaderPages_InactiveWork_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var worksList = await unitOfWork.WorkRepository.GetPagedAsync(1, 200, null, "DESC", null, null, null, null, null, null, null, null, null, default);
        var inactiveWork = worksList.Item1.FirstOrDefault(w => !w.IsActive);

        if (inactiveWork is null)
        {
            return;
        }

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => works.GetReaderPagesAsync(inactiveWork.Id, default));
    }

    [Fact]
    public async Task GetReaderPages_PagesPreserveOrder()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);
        if (entity is null || entity.Pages.Count < 2)
        {
            return;
        }

        var result = await works.GetReaderPagesAsync(candidate.Id, default);

        var expectedOrder = entity.Pages.OrderBy(p => p.Order).Select(p => p.Id).ToList();
        var actualOrder = result.Pages.Select(p => p.Id).ToList();

        Assert.Equal(expectedOrder, actualOrder);
    }

    [Fact]
    public async Task GetReaderPages_DoesNotExposePhysicalPaths()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var result = await works.GetReaderPagesAsync(candidate.Id, default);

        foreach (var page in result.Pages)
        {
            Assert.False(string.IsNullOrWhiteSpace(page.Url));
            Assert.StartsWith("/images/", page.Url);
            Assert.DoesNotContain("Storage", page.Url);
            Assert.DoesNotContain("Temp", page.Url);
            Assert.DoesNotContain("\\", page.Url);
        }
    }

    [Fact]
    public async Task GetReaderPages_ReturnsPreviousWork_WhenExists()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var entity = await unitOfWork.WorkRepository.GetByIdWithNavigationAsync(candidate.Id, default);
        if (entity?.PreviousNumber is null)
        {
            return;
        }

        var result = await works.GetReaderPagesAsync(candidate.Id, default);

        Assert.NotNull(result.PreviousWork);
        Assert.Equal(entity.PreviousNumber.Id, result.PreviousWork!.Id);
        Assert.Equal(entity.PreviousNumber.Title, result.PreviousWork!.Title);
        Assert.Equal(entity.PreviousNumber.NumberValue, result.PreviousWork!.NumberValue);
    }

    [Fact]
    public async Task GetReaderPages_ReturnsNextWork_WhenExists()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var entity = await unitOfWork.WorkRepository.GetByIdWithNavigationAsync(candidate.Id, default);
        if (entity?.NextNumber is null)
        {
            return;
        }

        var result = await works.GetReaderPagesAsync(candidate.Id, default);

        Assert.NotNull(result.NextWork);
        Assert.Equal(entity.NextNumber.Id, result.NextWork!.Id);
        Assert.Equal(entity.NextNumber.Title, result.NextWork!.Title);
        Assert.Equal(entity.NextNumber.NumberValue, result.NextWork!.NumberValue);
    }
}
