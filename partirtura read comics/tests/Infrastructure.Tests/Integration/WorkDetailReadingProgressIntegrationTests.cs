using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkDetailReadingProgressIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public WorkDetailReadingProgressIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetCatalogById_AnonymousUser_ReturnsNullMyReadingProgress()
    {
        var workId = await PickWorkWithPagesAsync(_fixture);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var detail = await works.GetCatalogByIdAsync(workId, null, default);

        Assert.Null(detail.MyReadingProgress);
    }

    [Fact]
    public async Task GetCatalogById_AuthenticatedUserWithoutProgress_ReturnsNullMyReadingProgress()
    {
        var (workId, user) = await PickWorkWithoutProgressAsync(_fixture);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var detail = await works.GetCatalogByIdAsync(workId, user.Id, default);

        Assert.Null(detail.MyReadingProgress);
    }

    [Fact]
    public async Task GetCatalogById_UserWithProgress_ReturnsStoredReadingProgress()
    {
        var (workId, user) = await PickWorkWithoutProgressAsync(_fixture);
        var totalPages = await ReadWorkPagesCountAsync(_fixture, workId);
        var currentPage = 3;

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await service.UpdateReadingProgressAsync(workId, user.Id, currentPage, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var detail = await works.GetCatalogByIdAsync(workId, user.Id, default);
        var persisted = await ReadProgressAsync(_fixture, workId, user.Id);

        Assert.NotNull(detail.MyReadingProgress);
        Assert.NotNull(persisted);
        Assert.Equal(persisted!.CurrentPage, detail.MyReadingProgress!.CurrentPage);
        Assert.Equal(currentPage, detail.MyReadingProgress.CurrentPage);
        Assert.Equal(totalPages, detail.MyReadingProgress.TotalPages);
        Assert.Equal(persisted.PercentageReading, detail.MyReadingProgress.Percentage);
        Assert.Equal(persisted.LastReadAt, detail.MyReadingProgress.LastReadAt);
        Assert.Equal("Reading", detail.MyReadingProgress.Status);
        Assert.Equal((currentPage - 1) * 100 / totalPages, detail.MyReadingProgress.Percentage);
    }

    [Fact]
    public async Task GetCatalogById_CompletedProgress_ReturnsCompletedStatusAndFullPercentage()
    {
        var (workId, user) = await PickWorkWithoutProgressAsync(_fixture);
        var totalPages = await ReadWorkPagesCountAsync(_fixture, workId);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await service.UpdateReadingProgressAsync(workId, user.Id, totalPages + 1, default);
        }

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var detail = await works.GetCatalogByIdAsync(workId, user.Id, default);

        Assert.NotNull(detail.MyReadingProgress);
        Assert.Equal(totalPages + 1, detail.MyReadingProgress!.CurrentPage);
        Assert.Equal(totalPages, detail.MyReadingProgress.TotalPages);
        Assert.Equal(100, detail.MyReadingProgress.Percentage);
        Assert.Equal("Completed", detail.MyReadingProgress.Status);
    }

    [Fact]
    public async Task GetCatalogById_DoesNotModifyReadingProgress()
    {
        var (workId, user) = await PickWorkWithoutProgressAsync(_fixture);
        var totalPages = await ReadWorkPagesCountAsync(_fixture, workId);

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
            await service.UpdateReadingProgressAsync(workId, user.Id, 2, default);
        }

        var before = await ReadProgressAsync(_fixture, workId, user.Id);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        await works.GetCatalogByIdAsync(workId, user.Id, default);

        var after = await ReadProgressAsync(_fixture, workId, user.Id);

        Assert.NotNull(before);
        Assert.NotNull(after);
        Assert.Equal(before!.CurrentPage, after!.CurrentPage);
        Assert.Equal(before.TotalPages, after.TotalPages);
        Assert.Equal(before.PercentageReading, after.PercentageReading);
        Assert.Equal(before.LastReadAt, after.LastReadAt);
        Assert.Equal(before.State, after.State);
    }

    private static async Task<long> PickWorkWithPagesAsync(IntegrationTestFixture fixture)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 50 }, null, default);

        foreach (var item in catalog.Items)
        {
            if (await ReadWorkPagesCountAsync(fixture, item.Id) > 0)
            {
                return item.Id;
            }
        }

        throw new InvalidOperationException("The development database has no active work with pages to run the reading progress detail tests.");
    }

    private static async Task<(long WorkId, User User)> PickWorkWithoutProgressAsync(IntegrationTestFixture fixture)
    {
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(fixture, 1);

        using var scope = fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var catalog = await works.GetCatalogPagedAsync(new GetCatalogWorksRequest { pageSize = 50 }, null, default);

        foreach (var item in catalog.Items)
        {
            var progress = await ReadProgressAsync(fixture, item.Id, users[0].Id);

            if (progress is not null)
            {
                continue;
            }

            if (await ReadWorkPagesCountAsync(fixture, item.Id) == 0)
            {
                continue;
            }

            return (item.Id, users[0]);
        }

        throw new InvalidOperationException("The development database has no active work with pages and without reading progress for the selected user.");
    }

    private static async Task<int> ReadWorkPagesCountAsync(IntegrationTestFixture fixture, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);

        if (work is null)
        {
            throw new InvalidOperationException($"Work {workId} no longer exists in the development database.");
        }

        return work.Pages?.Count ?? 0;
    }

    private static async Task<WorkReadingProgress?> ReadProgressAsync(IntegrationTestFixture fixture, long workId, long userId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        return await unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, default);
    }
}
