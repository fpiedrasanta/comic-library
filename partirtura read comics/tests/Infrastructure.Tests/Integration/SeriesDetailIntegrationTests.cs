using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class SeriesDetailIntegrationTests
{
    private const int PageSize = 24;
    private const long UnknownId = 9_999_999_999;

    private readonly IntegrationTestFixture _fixture;

    public SeriesDetailIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetPublicDetail_ExistingSeries_ReturnsItsPublicData()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);
        var candidate = active.Items.First(item => item.Id > 0);

        var detail = await series.GetPublicDetailAsync(candidate.Id, default);
        var entity = await unitOfWork.SeriesRepository.GetDetailByIdAsync(candidate.Id, default);

        Assert.NotNull(entity);
        Assert.Equal(candidate.Id, detail.Id);
        Assert.Equal(entity!.Name, detail.Name);
        Assert.Equal(entity.Description, detail.Description);
        Assert.Equal(entity.Color, detail.Color);
    }

    [Fact]
    public async Task GetPublicDetail_ReturnsFranchiseIdAndName()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);

        foreach (var candidate in active.Items)
        {
            var detail = await series.GetPublicDetailAsync(candidate.Id, default);
            var entity = await unitOfWork.SeriesRepository.GetDetailByIdAsync(candidate.Id, default);

            Assert.NotNull(entity!.Franchise);
            Assert.NotNull(detail.Franchise);
            Assert.Equal(entity.Franchise.Id, detail.Franchise!.Id);
            Assert.Equal(entity.Franchise.Name, detail.Franchise.Name);
            Assert.Equal(entity.Franchise.Color, detail.Franchise.Color);
        }
    }

    [Fact]
    public async Task GetPublicDetail_ReturnsPublisherIdAndName()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);

        foreach (var candidate in active.Items)
        {
            var detail = await series.GetPublicDetailAsync(candidate.Id, default);
            var entity = await unitOfWork.SeriesRepository.GetDetailByIdAsync(candidate.Id, default);

            Assert.NotNull(entity!.Franchise.Publisher);
            Assert.NotNull(detail.Publisher);
            Assert.Equal(entity.Franchise.Publisher.Id, detail.Publisher!.Id);
            Assert.Equal(entity.Franchise.Publisher.Name, detail.Publisher.Name);
            Assert.Equal(entity.Franchise.Publisher.Color, detail.Publisher.Color);
        }
    }

    [Fact]
    public async Task GetPublicDetail_PublisherMatchesTheCatalogFilter()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await series.GetPublicDetailAsync(candidate.Id, default);

            Assert.Equal(candidate.PublisherId, detail.Publisher?.Id);
            Assert.Equal(candidate.PublisherName, detail.Publisher?.Name);
            Assert.Equal(candidate.FranchiseId, detail.Franchise?.Id);
            Assert.Equal(candidate.FranchiseName, detail.Franchise?.Name);
        }
    }

    [Fact]
    public async Task GetPublicDetail_ExposesImageUrlWhenImageExists()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await series.GetPublicDetailAsync(candidate.Id, default);
            var entity = await unitOfWork.SeriesRepository.GetDetailByIdAsync(candidate.Id, default);

            var expected = entity!.Image is null ? null : $"/images/{entity.Image.Id}";

            Assert.Equal(expected, detail.UrlImage);
        }
    }

    [Fact]
    public async Task GetPublicDetail_MissingImage_ReturnsNullUrlImage()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);

        var withoutImage = new List<long>();
        foreach (var candidate in active.Items)
        {
            var entity = await unitOfWork.SeriesRepository.GetDetailByIdAsync(candidate.Id, default);
            if (entity!.Image is null)
            {
                withoutImage.Add(candidate.Id);
            }
        }

        foreach (var seriesId in withoutImage)
        {
            var detail = await series.GetPublicDetailAsync(seriesId, default);
            Assert.Null(detail.UrlImage);
        }
    }

    [Fact]
    public async Task GetPublicDetail_OptionalDataCanBeAbsent()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);

        foreach (var candidate in active.Items)
        {
            var detail = await series.GetPublicDetailAsync(candidate.Id, default);

            Assert.False(string.IsNullOrWhiteSpace(detail.Name));
            Assert.True(detail.UrlImage is null || detail.UrlImage.StartsWith("/images/"));
            Assert.NotNull(detail.Franchise);
            Assert.NotNull(detail.Publisher);
        }
    }

    [Fact]
    public async Task GetPublicDetail_UnknownSeries_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => series.GetPublicDetailAsync(UnknownId, default));
    }

    [Fact]
    public async Task GetPublicDetail_NonPositiveId_ThrowsValidation()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        await Assert.ThrowsAsync<ValidationException>(() => series.GetPublicDetailAsync(0, default));
        await Assert.ThrowsAsync<ValidationException>(() => series.GetPublicDetailAsync(-1, default));
    }

    [Fact]
    public async Task GetPublicDetail_InactiveSeries_ThrowsNotFound()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var inactive = await series.GetPagedAsync(new GetSeriesRequest { IsActive = false, currentPage = 1, pageSize = PageSize }, default);

        foreach (var candidate in inactive.Items)
        {
            await Assert.ThrowsAsync<BusinessNotFoundException>(() => series.GetPublicDetailAsync(candidate.Id, default));
        }
    }

    [Fact]
    public async Task GetPublicDetail_DoesNotExposeAdministrativeFields()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var series = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        var active = await series.GetPublicPagedAsync(new GetPublicSeriesRequest { pageSize = PageSize }, default);
        var detail = await series.GetPublicDetailAsync(active.Items.First().Id, default);

        var publicProperties = typeof(PublicSeriesDetailDto).GetProperties().Select(p => p.Name).ToHashSet();

        Assert.DoesNotContain("IsActive", publicProperties);
        Assert.DoesNotContain("IsFeatured", publicProperties);
        Assert.DoesNotContain("IsOngoing", publicProperties);
        Assert.DoesNotContain("CreatedAt", publicProperties);
        Assert.False(string.IsNullOrWhiteSpace(detail.Name));
    }
}