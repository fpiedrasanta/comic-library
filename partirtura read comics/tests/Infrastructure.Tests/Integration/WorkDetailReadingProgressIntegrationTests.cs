using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkDetailReadingProgressIntegrationTests
{
    private const int DefaultPageCount = 10;

    private readonly IntegrationTestFixture _fixture;

    public WorkDetailReadingProgressIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetCatalogById_AnonymousUser_ReturnsNullMyReadingProgress()
    {
        var (workId, imageIds) = await CreateWorkWithPagesAsync(_fixture, DefaultPageCount);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var detail = await works.GetCatalogByIdAsync(workId, null, default);

            Assert.NotNull(detail);
            Assert.Null(detail!.MyReadingProgress);
        }
        finally
        {
            await CleanUpWorkWithPagesAsync(_fixture, workId, imageIds);
        }
    }

    [Fact]
    public async Task GetCatalogById_AuthenticatedUserWithoutProgress_ReturnsNullMyReadingProgress()
    {
        var (workId, imageIds) = await CreateWorkWithPagesAsync(_fixture, DefaultPageCount);
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var detail = await works.GetCatalogByIdAsync(workId, user.Id, default);

            Assert.NotNull(detail);
            Assert.Null(detail!.MyReadingProgress);
        }
        finally
        {
            await CleanUpWorkWithPagesAsync(_fixture, workId, imageIds);
        }
    }

    [Fact]
    public async Task GetCatalogById_UserWithProgress_ReturnsStoredReadingProgress()
    {
        var (workId, imageIds) = await CreateWorkWithPagesAsync(_fixture, DefaultPageCount);
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var totalPages = await ReadWorkPagesCountAsync(_fixture, workId);
        var currentPage = 3;

        try
        {
            using (var setupScope = _fixture.ScopeFactory.CreateScope())
            {
                var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
                await service.UpdateReadingProgressAsync(workId, user.Id, currentPage, default);
            }

            using var scope = _fixture.ScopeFactory.CreateScope();
            var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var detail = await works.GetCatalogByIdAsync(workId, user.Id, default);
            var persisted = await ReadProgressAsync(_fixture, workId, user.Id);

            Assert.NotNull(detail);
            Assert.NotNull(detail!.MyReadingProgress);
            Assert.NotNull(persisted);
            Assert.Equal(persisted!.CurrentPage, detail.MyReadingProgress!.CurrentPage);
            Assert.Equal(currentPage, detail.MyReadingProgress.CurrentPage);
            Assert.Equal(totalPages, detail.MyReadingProgress.TotalPages);
            Assert.Equal(persisted.PercentageReading, detail.MyReadingProgress.Percentage);
            Assert.Equal(persisted.LastReadAt, detail.MyReadingProgress.LastReadAt);
            Assert.Equal("Reading", detail.MyReadingProgress.Status);
            Assert.Equal((currentPage - 1) * 100 / totalPages, detail.MyReadingProgress.Percentage);
        }
        finally
        {
            await CleanUpWorkWithPagesAsync(_fixture, workId, imageIds);
        }
    }

    [Fact]
    public async Task GetCatalogById_CompletedProgress_ReturnsCompletedStatusAndFullPercentage()
    {
        var (workId, imageIds) = await CreateWorkWithPagesAsync(_fixture, DefaultPageCount);
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var totalPages = await ReadWorkPagesCountAsync(_fixture, workId);

        try
        {
            using (var setupScope = _fixture.ScopeFactory.CreateScope())
            {
                var service = setupScope.ServiceProvider.GetRequiredService<IWorkService>();
                await service.UpdateReadingProgressAsync(workId, user.Id, totalPages + 1, default);
            }

            using var scope = _fixture.ScopeFactory.CreateScope();
            var works = scope.ServiceProvider.GetRequiredService<IWorkService>();

            var detail = await works.GetCatalogByIdAsync(workId, user.Id, default);

            Assert.NotNull(detail);
            Assert.NotNull(detail!.MyReadingProgress);
            Assert.Equal(totalPages + 1, detail.MyReadingProgress!.CurrentPage);
            Assert.Equal(totalPages, detail.MyReadingProgress.TotalPages);
            Assert.Equal(100, detail.MyReadingProgress.Percentage);
            Assert.Equal("Completed", detail.MyReadingProgress.Status);
        }
        finally
        {
            await CleanUpWorkWithPagesAsync(_fixture, workId, imageIds);
        }
    }

    [Fact]
    public async Task GetCatalogById_DoesNotModifyReadingProgress()
    {
        var (workId, imageIds) = await CreateWorkWithPagesAsync(_fixture, DefaultPageCount);
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1))[0];
        var totalPages = await ReadWorkPagesCountAsync(_fixture, workId);

        try
        {
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
        finally
        {
            await CleanUpWorkWithPagesAsync(_fixture, workId, imageIds);
        }
    }

    private static async Task<(long WorkId, long[] ImageIds)> CreateWorkWithPagesAsync(IntegrationTestFixture fixture, int pageCount)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var workType = await dbContext.WorkTypes.FirstAsync();
        var language = await dbContext.Languages.FirstAsync();

        var work = new Work
        {
            Title = $"detail-progress work {Guid.NewGuid():N}",
            WorkType = workType,
            Language = language,
            IsActive = true,
            ContentStatus = ContentStatus.Missing,
            CreatedAt = DateTime.UtcNow
        };
        await unitOfWork.WorkRepository.AddAsync(work, default);
        await unitOfWork.SaveChangesAsync(default);

        var imageIds = new long[pageCount];
        var pages = new List<Page>();

        for (var i = 0; i < pageCount; i++)
        {
            var image = new Image
            {
                FileName = $"page_{Guid.NewGuid():N}.png",
                ContentType = "image/png",
                Size = 0,
                StoragePath = $"/tmp/page_{Guid.NewGuid():N}.png",
                IsActive = true,
                Type = ImageType.Page,
                Width = 1,
                Height = 1
            };

            dbContext.Files.Add(image);
            await dbContext.SaveChangesAsync(default);

            imageIds[i] = image.Id;

            pages.Add(new Page
            {
                Order = i + 1,
                Work = work,
                Image = image
            });
        }

        dbContext.Pages.AddRange(pages);
        await dbContext.SaveChangesAsync(default);

        return (work.Id, imageIds);
    }

    private static async Task CleanUpWorkWithPagesAsync(IntegrationTestFixture fixture, long workId, long[] imageIds)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var progresses = await dbContext.WorkReadingProgresses
            .Where(progress => progress.Work != null && progress.Work.Id == workId)
            .ToListAsync();
        dbContext.WorkReadingProgresses.RemoveRange(progresses);

        var ratings = await dbContext.WorkRatings
            .Where(rating => rating.Work != null && rating.Work.Id == workId)
            .ToListAsync();
        dbContext.WorkRatings.RemoveRange(ratings);

        var pages = await dbContext.Pages
            .Where(page => EF.Property<long>(page, "WorkId") == workId)
            .ToListAsync();
        dbContext.Pages.RemoveRange(pages);

        var work = await dbContext.Works.FirstOrDefaultAsync(w => w.Id == workId);
        if (work is not null)
        {
            dbContext.Works.Remove(work);
        }

        if (imageIds.Length > 0)
        {
            var images = await dbContext.Files
                .Where(f => imageIds.Contains(f.Id) && f is Image)
                .ToListAsync();
            dbContext.Files.RemoveRange(images);
        }

        await dbContext.SaveChangesAsync(default);
    }

    private static async Task<int> ReadWorkPagesCountAsync(IntegrationTestFixture fixture, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.Pages.CountAsync(p => EF.Property<long>(p, "WorkId") == workId);
    }

    private static async Task<WorkReadingProgress?> ReadProgressAsync(IntegrationTestFixture fixture, long workId, long userId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        return await unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, default);
    }
}
