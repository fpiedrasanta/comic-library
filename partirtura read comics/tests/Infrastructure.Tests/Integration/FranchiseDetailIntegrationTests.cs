using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class FranchiseDetailIntegrationTests
{
    private const int PageSize = 24;
    private const long UnknownId = 9_999_999_999;

    private readonly IntegrationTestFixture _fixture;

    public FranchiseDetailIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetPublicDetail_ExistingFranchise_ReturnsItsPublicData()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);
        var candidate = active.Items.First(item => item.Id > 0);

        var detail = await franchises.GetPublicDetailAsync(candidate.Id, default);
        var entity = await unitOfWork.FranchiseRepository.GetDetailByIdAsync(candidate.Id, default);

        Assert.NotNull(entity);
        Assert.Equal(candidate.Id, detail.Id);
        Assert.Equal(entity!.Name, detail.Name);
        Assert.Equal(entity.Description, detail.Description);
        Assert.Equal(entity.Color, detail.Color);
    }

    [Fact]
    public async Task GetPublicDetail_ExposesImageUrlWhenImageExists()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await franchises.GetPublicDetailAsync(candidate.Id, default);
            var entity = await unitOfWork.FranchiseRepository.GetDetailByIdAsync(candidate.Id, default);

            var expected = entity!.Image is null ? null : $"/images/{entity.Image.Id}";

            Assert.Equal(expected, detail.UrlImage);
        }
    }

    [Fact]
    public async Task GetPublicDetail_MissingImage_ReturnsNullUrlImage()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);

        var withoutImage = new List<long>();
        foreach (var candidate in active.Items)
        {
            var entity = await unitOfWork.FranchiseRepository.GetDetailByIdAsync(candidate.Id, default);
            if (entity!.Image is null)
            {
                withoutImage.Add(candidate.Id);
            }
        }

        foreach (var franchiseId in withoutImage)
        {
            var detail = await franchises.GetPublicDetailAsync(franchiseId, default);
            Assert.Null(detail.UrlImage);
        }
    }

    [Fact]
    public async Task GetPublicDetail_OptionalDataCanBeAbsent()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await franchises.GetPublicDetailAsync(candidate.Id, default);

            Assert.False(string.IsNullOrWhiteSpace(detail.Name));
            Assert.True(detail.UrlImage is null || detail.UrlImage.StartsWith("/images/"));
        }

        var withoutOptionalData = active.Items
            .Where(item => item.Color is null)
            .Select(item => item.Id)
            .ToList();

        foreach (var franchiseId in withoutOptionalData)
        {
            var detail = await franchises.GetPublicDetailAsync(franchiseId, default);
            Assert.Null(detail.Color);
        }
    }

    [Fact]
    public async Task GetPublicDetail_ResolvesThePublisherFields()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);

        foreach (var candidate in active.Items)
        {
            var detail = await franchises.GetPublicDetailAsync(candidate.Id, default);
            var entity = await unitOfWork.FranchiseRepository.GetDetailByIdAsync(candidate.Id, default);

            Assert.NotNull(entity!.Publisher);
            Assert.Equal(entity.Publisher.Id, detail.PublisherId);
            Assert.Equal(entity.Publisher.Name, detail.PublisherName);
            Assert.Equal(entity.Publisher.Color, detail.PublisherColor);
        }
    }

    [Fact]
    public async Task GetPublicDetail_PublisherFieldsMatchTheCatalogFilter()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await franchises.GetPublicDetailAsync(candidate.Id, default);

            Assert.Equal(candidate.PublisherId, detail.PublisherId);
            Assert.Equal(candidate.PublisherName, detail.PublisherName);
        }
    }

    [Fact]
    public async Task GetPublicDetail_UnknownFranchise_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => franchises.GetPublicDetailAsync(UnknownId, default));
    }

    [Fact]
    public async Task GetPublicDetail_NonPositiveId_ThrowsValidation()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        await Assert.ThrowsAsync<ValidationException>(() => franchises.GetPublicDetailAsync(0, default));
        await Assert.ThrowsAsync<ValidationException>(() => franchises.GetPublicDetailAsync(-1, default));
    }

    [Fact]
    public async Task GetPublicDetail_InactiveFranchise_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var inactive = await franchises.GetPagedAsync(new GetFranchisesRequest { IsActive = false, currentPage = 1, pageSize = PageSize }, default);

        foreach (var candidate in inactive.Items)
        {
            await Assert.ThrowsAsync<BusinessNotFoundException>(() => franchises.GetPublicDetailAsync(candidate.Id, default));
        }
    }

    [Fact]
    public async Task GetPublicDetail_DoesNotExposeAdministrativeFields()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();

        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);
        var detail = await franchises.GetPublicDetailAsync(active.Items.First().Id, default);

        var publicProperties = typeof(PublicFranchiseDetailDto).GetProperties().Select(p => p.Name).ToHashSet();

        Assert.DoesNotContain("IsActive", publicProperties);
        Assert.DoesNotContain("IsFeatured", publicProperties);
        Assert.DoesNotContain("IsOngoing", publicProperties);
        Assert.DoesNotContain("CreatedAt", publicProperties);
        Assert.False(string.IsNullOrWhiteSpace(detail.Name));
    }
}