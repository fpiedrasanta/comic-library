using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class SeriesDescriptionIntegrationTests
{
    private const int PageSize = 24;

    private static int _sequence;

    private readonly IntegrationTestFixture _fixture;

    public SeriesDescriptionIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateSeries_WithDescription_PersistsAndReturnsIt()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var description = "The Amazing Spider-Man, the flagship Marvel title.";
        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), description, franchise, "#AABBCC", false, true, null, null),
            default);

        await DeactivateAsync(created.Id);

        Assert.Equal(description, created.Description);

        var persisted = await ReadFromDatabaseAsync(created.Id);
        Assert.Equal(description, persisted);
    }

    [Fact]
    public async Task CreateSeries_WithoutDescription_StoresNull()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), null, franchise, null, false, true, null, null),
            default);

        await DeactivateAsync(created.Id);

        Assert.Null(created.Description);

        var persisted = await ReadFromDatabaseAsync(created.Id);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task UpdateSeries_WithDescription_PersistsTheNewValue()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), "Description before the edit.", franchise, null, false, true, null, null),
            default);

        try
        {
            var updated = await seriesService.UpdateSeriesAsync(
                created.Id,
                new UpdateSeriesRequest(created.Name, "Description after the edit.", franchise, null, null, false, true, null, null),
                default);

            Assert.Equal("Description after the edit.", updated.Description);

            var persisted = await ReadFromDatabaseAsync(created.Id);
            Assert.Equal("Description after the edit.", persisted);
        }
        finally
        {
            await DeactivateAsync(created.Id);
        }
    }

    [Fact]
    public async Task UpdateSeries_WithNullDescription_ClearsIt()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), "A description that will be removed.", franchise, null, false, true, null, null),
            default);

        try
        {
            Assert.NotNull(created.Description);

            var updated = await seriesService.UpdateSeriesAsync(
                created.Id,
                new UpdateSeriesRequest(created.Name, null, franchise, null, null, false, true, null, null),
                default);

            Assert.Null(updated.Description);

            var persisted = await ReadFromDatabaseAsync(created.Id);
            Assert.Null(persisted);
        }
        finally
        {
            await DeactivateAsync(created.Id);
        }
    }

    [Fact]
    public async Task GetById_ReturnsTheStoredDescription()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var description = "Detective Comics, home of the Dark Knight.";
        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), description, franchise, null, false, true, null, null),
            default);

        try
        {
            var detail = await seriesService.GetByIdAsync(created.Id, default);

            Assert.Equal(description, detail.Description);
        }
        finally
        {
            await DeactivateAsync(created.Id);
        }
    }

    [Fact]
    public async Task GetById_WithoutDescription_ReturnsNull()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), null, franchise, null, false, true, null, null),
            default);

        try
        {
            var detail = await seriesService.GetByIdAsync(created.Id, default);

            Assert.Null(detail.Description);
            Assert.False(string.IsNullOrWhiteSpace(detail.Name));
        }
        finally
        {
            await DeactivateAsync(created.Id);
        }
    }

    [Fact]
    public async Task Description_IsTrimmedLikeTheOtherCatalogEntities()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var franchise = await AnyActiveFranchiseAsync(scope);

        var created = await seriesService.CreateSeriesAsync(
            new CreateSeriesRequest(NextName(), "  Padded description.  ", franchise, null, false, true, null, null),
            default);

        await DeactivateAsync(created.Id);

        Assert.Equal("Padded description.", created.Description);

        var persisted = await ReadFromDatabaseAsync(created.Id);
        Assert.Equal("Padded description.", persisted);
    }

    [Fact]
    public void SeriesDetailDto_SerializesDescriptionAsDescription()
    {
        var detail = new SeriesDetailDto(
            1,
            "Series Name",
            "Some description.",
            1,
            "Franchise",
            null,
            null,
            null,
            false,
            false,
            true,
            1,
            "Publisher",
            null,
            null,
            null,
            null,
            false,
            true,
            true);

        var json = System.Text.Json.JsonSerializer.Serialize(detail, new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web));

        Assert.Contains("\"description\":\"Some description.\"", json);
    }

    [Fact]
    public void Series_Entity_ExposesDescriptionAsNullable()
    {
        var property = typeof(Domain.Entities.Series).GetProperty("Description");

        Assert.NotNull(property);
        Assert.Equal(typeof(string), property!.PropertyType);
        Assert.True(property.CanWrite);
    }

    private static string NextName()
    {
        var index = Interlocked.Increment(ref _sequence);
        return $"Series Description Probe {index} {DateTime.UtcNow:yyyyMMddHHmmssfff}";
    }

    private static async Task<long> AnyActiveFranchiseAsync(IServiceScope scope)
    {
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var active = await franchises.GetPublicPagedAsync(new GetPublicFranchisesRequest { pageSize = PageSize }, default);

        Assert.NotEmpty(active.Items);
        return active.Items.First().Id;
    }

    private async Task<string?> ReadFromDatabaseAsync(long seriesId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var entity = await unitOfWork.SeriesRepository.GetByIdAsync(seriesId, default);

        Assert.NotNull(entity);
        return entity!.Description;
    }

    private async Task DeactivateAsync(long seriesId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();

        await seriesService.DeactivateSeriesAsync(seriesId, default);
    }
}