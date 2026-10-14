using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class PublisherDetailIntegrationTests
{
    private const int PageSize = 24;
    private const long UnknownId = 9_999_999_999;

    private readonly IntegrationTestFixture _fixture;

    public PublisherDetailIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetPublicDetail_ExistingPublisher_ReturnsItsPublicData()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        var candidate = active.Items.First(item => item.Id > 0);

        var detail = await publishers.GetPublicDetailAsync(candidate.Id, default);
        var entity = await unitOfWork.PublisherRepository.GetDetailByIdAsync(candidate.Id, default);

        Assert.NotNull(entity);
        Assert.Equal(candidate.Id, detail.Id);
        Assert.Equal(entity!.Name, detail.Name);
        Assert.Equal(entity.Color, detail.Color);
        Assert.Equal(entity.Website, detail.Website);
        Assert.Equal(entity.Description, detail.Description);
        Assert.Equal(entity.History, detail.History);
        Assert.Equal(entity.FoundedYear, detail.FoundedYear);
        Assert.Equal(entity.Country?.Name, detail.CountryName);
    }

    [Fact]
    public async Task GetPublicDetail_ExposesLogoUrlWhenImageExists()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await publishers.GetPublicDetailAsync(candidate.Id, default);
            var entity = await unitOfWork.PublisherRepository.GetDetailByIdAsync(candidate.Id, default);

            var expected = entity!.Image is null ? null : $"/images/{entity.Image.Id}";

            Assert.Equal(expected, detail.UrlImage);
        }
    }

    [Fact]
    public async Task GetPublicDetail_OptionalDataCanBeAbsent()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var active = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await publishers.GetPublicDetailAsync(candidate.Id, default);

            Assert.False(string.IsNullOrWhiteSpace(detail.Name));
            Assert.True(detail.UrlImage is null || detail.UrlImage.StartsWith("/images/"));
        }

        var withoutOptionalData = active.Items
            .Where(item => item.Color is null)
            .Select(item => item.Id)
            .ToList();

        foreach (var publisherId in withoutOptionalData)
        {
            var detail = await publishers.GetPublicDetailAsync(publisherId, default);
            Assert.Null(detail.Color);
        }
    }

    [Fact]
    public async Task GetPublicDetail_UnknownPublisher_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => publishers.GetPublicDetailAsync(UnknownId, default));
    }

    [Fact]
    public async Task GetPublicDetail_NonPositiveId_ThrowsValidation()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        await Assert.ThrowsAsync<ValidationException>(() => publishers.GetPublicDetailAsync(0, default));
        await Assert.ThrowsAsync<ValidationException>(() => publishers.GetPublicDetailAsync(-1, default));
    }

    [Fact]
    public async Task GetPublicDetail_InactivePublisher_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var inactive = await publishers.GetPagedAsync(new GetPublishersRequest { IsActive = false, currentPage = 1, pageSize = PageSize }, default);

        foreach (var candidate in inactive.Items)
        {
            await Assert.ThrowsAsync<BusinessNotFoundException>(() => publishers.GetPublicDetailAsync(candidate.Id, default));
        }
    }

    [Fact]
    public async Task GetPublicDetail_DoesNotExposeAdministrativeFields()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();

        var active = await publishers.GetPublicPagedAsync(new ListRequest { pageSize = PageSize }, default);
        var detail = await publishers.GetPublicDetailAsync(active.Items.First().Id, default);

        var publicProperties = typeof(PublisherDetailDto).GetProperties().Select(p => p.Name).ToHashSet();

        Assert.DoesNotContain("IsActive", publicProperties);
        Assert.DoesNotContain("IsFeatured", publicProperties);
        Assert.DoesNotContain("IsAlive", publicProperties);
        Assert.DoesNotContain("CreatedAt", publicProperties);
        Assert.False(string.IsNullOrWhiteSpace(detail.Name));
    }
}