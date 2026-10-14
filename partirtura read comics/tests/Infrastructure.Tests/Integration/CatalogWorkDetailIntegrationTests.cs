using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class CatalogWorkDetailIntegrationTests
{
    private const long UnknownId = 9_999_999_999;
    private readonly IntegrationTestFixture _fixture;

    public CatalogWorkDetailIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetCatalogById_ExistingWork_ReturnsFullDetail()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);
        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);

        Assert.NotNull(entity);
        Assert.Equal(candidate.Id, detail.Id);
        Assert.Equal(entity.Title, detail.Title);
        Assert.Equal(entity.Description, detail.Description);
        Assert.Equal(entity.NumberValue, detail.NumberValue);
        Assert.Equal(entity.PublicationDate, detail.PublicationDate);
        Assert.Equal(entity.Language?.Name, detail.Language?.Name);
        Assert.Equal(entity.WorkType?.Name, detail.WorkType?.Name);
    }

    [Fact]
    public async Task GetCatalogById_ExposesContextNodes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);
        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);

        if (entity.Publisher is not null)
        {
            Assert.NotNull(detail.Publisher);
            Assert.Equal(entity.Publisher.Id, detail.Publisher!.Id);
            Assert.Equal(entity.Publisher.Name, detail.Publisher.Name);
            Assert.Equal(entity.Publisher.Color, detail.Publisher.Color);
        }
        else if (entity.Franchise?.Publisher is not null)
        {
            Assert.NotNull(detail.Publisher);
            Assert.Equal(entity.Franchise.Publisher.Id, detail.Publisher!.Id);
            Assert.Equal(entity.Franchise.Publisher.Name, detail.Publisher.Name);
            Assert.Equal(entity.Franchise.Publisher.Color, detail.Publisher.Color);
        }
        else if (entity.Series?.Franchise?.Publisher is not null)
        {
            Assert.NotNull(detail.Publisher);
            Assert.Equal(entity.Series.Franchise.Publisher.Id, detail.Publisher!.Id);
            Assert.Equal(entity.Series.Franchise.Publisher.Name, detail.Publisher.Name);
            Assert.Equal(entity.Series.Franchise.Publisher.Color, detail.Publisher.Color);
        }
        else
        {
            Assert.Null(detail.Publisher);
        }
    }

    [Fact]
    public async Task GetCatalogById_NumberCanBeNull()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);

        Assert.True(detail.NumberValue is null || detail.NumberValue.Length > 0);
    }

    [Fact]
    public async Task GetCatalogById_ExposesPublicImageUrls()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);
        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);

        var expectedCover = entity.Cover is null ? null : $"/images/{entity.Cover.Id}";
        Assert.Equal(expectedCover, detail.UrlCover);

        if (detail.Publisher is not null)
        {
            var publisher = entity.Publisher ?? entity.Franchise?.Publisher ?? entity.Series?.Franchise?.Publisher;
            var expected = publisher?.Image is null ? null : $"/images/{publisher.Image.Id}";
            Assert.Equal(expected, detail.Publisher.UrlCover);
        }
    }

    [Fact]
    public async Task GetCatalogById_ExposesPreviousWork()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);

        if (detail.PreviousWork is not null)
        {
            Assert.True(detail.PreviousWork.Id > 0);
            Assert.False(string.IsNullOrWhiteSpace(detail.PreviousWork.Title));
            Assert.True(detail.PreviousWork.UrlCover is null || detail.PreviousWork.UrlCover.StartsWith("/images/"));
        }
    }

    [Fact]
    public async Task GetCatalogById_ExposesNextWork()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);

        if (detail.NextWork is not null)
        {
            Assert.True(detail.NextWork.Id > 0);
            Assert.False(string.IsNullOrWhiteSpace(detail.NextWork.Title));
            Assert.True(detail.NextWork.UrlCover is null || detail.NextWork.UrlCover.StartsWith("/images/"));
        }
    }

    [Fact]
    public async Task GetCatalogById_PreservesPersonAssignmentsIndividually()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);
        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);

        var expectedCount = entity.PersonByRoles.Count;
        Assert.Equal(expectedCount, detail.PersonAssignments.Count);

        foreach (var assignment in detail.PersonAssignments)
        {
            Assert.True(assignment.PersonId > 0);
            Assert.False(string.IsNullOrWhiteSpace(assignment.PersonName));
            Assert.True(assignment.RoleId > 0);
            Assert.False(string.IsNullOrWhiteSpace(assignment.RoleName));
        }

        var duplicatePersons = detail.PersonAssignments.GroupBy(a => a.PersonId).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
        Assert.All(duplicatePersons, personId =>
        {
            var roles = detail.PersonAssignments.Where(a => a.PersonId == personId).Select(a => a.RoleId).Distinct().ToList();
            Assert.True(roles.Count > 1);
        });
    }

    [Fact]
    public async Task GetCatalogById_ExposesAllTags()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 24 }, null, default);
        var candidate = catalog.Items.First(item => item.Id > 0);

        var detail = await works.GetCatalogByIdAsync(candidate.Id, null, default);
        var entity = await unitOfWork.WorkRepository.GetByIdAsync(candidate.Id, default);

        Assert.Equal(entity.Tags.Count, detail.Tags.Count);
        foreach (var tag in detail.Tags)
        {
            Assert.True(tag.Id > 0);
            Assert.False(string.IsNullOrWhiteSpace(tag.Name));
        }
    }

    [Fact]
    public async Task GetCatalogById_UnknownWork_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => works.GetCatalogByIdAsync(UnknownId, null, default));
    }
}
