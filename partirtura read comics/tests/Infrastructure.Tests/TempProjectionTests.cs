using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class TempProjectionTests
{
    private readonly IntegrationTestFixture _fixture;

    public TempProjectionTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void ListProgressProjectionTranslates()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userId = 11L;

        var query = dbContext.WorkLists
            .AsNoTracking()
            .Include(workList => workList.ListType)
            .Include(workList => workList.Cover)
            .AsSplitQuery()
            .Where(workList => workList.IsActive)
            .Select(workList => new
            {
                WorkList = workList,
                WorkCount = workList.WorkListItems.Count(),
                CompletedWorkCount = dbContext.WorkReadingProgresses.Count(progress =>
                    progress.User != null && progress.User.Id == userId &&
                    progress.State == ReadingState.Completed &&
                    workList.WorkListItems.Any(item => item.Work != null && item.Work.Id == progress.Work!.Id)),
                HasReadingProgress = dbContext.WorkReadingProgresses.Any(progress =>
                    progress.User != null && progress.User.Id == userId &&
                    workList.WorkListItems.Any(item => item.Work != null && item.Work.Id == progress.Work!.Id))
            });

        var sql = query.ToQueryString();
        File.WriteAllText(System.IO.Path.Combine(System.IO.Path.GetTempPath(), "list-progress.log"), sql);
        Assert.Contains("SELECT", sql);
    }

    [Fact]
    public async Task ItemProgressBatchTranslates()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userId = 11L;
        var workIds = new[] { 2L, 21L, 22L };

        var query = dbContext.WorkReadingProgresses
            .AsNoTracking()
            .Where(progress => progress.User != null && progress.User.Id == userId && progress.Work != null && workIds.Contains(progress.Work.Id))
            .Select(progress => new { progress.Work!.Id, progress.PercentageReading, progress.State });

        var sql = query.ToQueryString();
        var rows = await query.ToListAsync(default);
        File.WriteAllText(System.IO.Path.Combine(System.IO.Path.GetTempPath(), "item-progress.log"), sql);
        Assert.NotNull(rows);
    }
}
