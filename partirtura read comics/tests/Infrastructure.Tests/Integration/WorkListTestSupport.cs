using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Tests.Integration;

internal static class WorkListTestSupport
{
    public static async Task<ListTestContext> CreateListAsync(IntegrationTestFixture fixture, int workCount = 2, int ratingCount = 0, double averageRating = 0.0)
    {
        var user = (await WorkRatingTestSupport.PickActiveUsersAsync(fixture, 1))[0];
        var unique = Guid.NewGuid().ToString("N");

        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var workType = await dbContext.WorkTypes.FirstAsync();
        var language = await dbContext.Languages.FirstAsync();
        var listType = await dbContext.ListTypes.FirstAsync();

        var workList = new WorkList
        {
            Name = $"US-0035 progress {unique}",
            ListType = listType,
            OwnerType = OwnerType.System,
            Visibility = Visibility.Public,
            IsActive = true,
            RatingCount = ratingCount,
            AverageRating = averageRating,
            WorkListItems = new List<WorkListItem>()
        };

        var createdWorks = new List<Work>();
        for (var position = 1; position <= workCount; position++)
        {
            var work = new Work
            {
                Title = $"US-0035 work {unique} {position}",
                WorkType = workType,
                Language = language,
                IsActive = true,
                ContentStatus = ContentStatus.Missing,
                CreatedAt = DateTime.UtcNow
            };
            await unitOfWork.WorkRepository.AddAsync(work, default);
            workList.WorkListItems.Add(new WorkListItem { Work = work, Position = position });
            createdWorks.Add(work);
        }

        await unitOfWork.WorkListRepository.AddAsync(workList, default);
        await unitOfWork.SaveChangesAsync(default);

        var workIds = createdWorks.Select(work => work.Id).ToList();
        return new ListTestContext(
            workList.Id,
            user.Id,
            workIds.Count > 0 ? workIds[0] : 0,
            workIds.Count > 1 ? workIds[1] : 0,
            workIds);
    }

    public static async Task SetProgressAsync(IntegrationTestFixture fixture, long userId, long workId, ReadingState state, int percentageReading, int currentPage = 1, int totalPages = 10)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var progress = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, default);
        if (progress is null)
        {
            var work = await dbContext.Works.FirstAsync(existing => existing.Id == workId);
            var user = await dbContext.Users.FirstAsync(existing => existing.Id == userId);
            progress = new WorkReadingProgress
            {
                Work = work,
                User = user,
                CurrentPage = currentPage,
                TotalPages = totalPages,
                PercentageReading = percentageReading,
                LastReadAt = DateTimeOffset.UtcNow,
                State = state
            };
            await unitOfWork.WorkReadingProgressRepository.AddAsync(progress, default);
        }
        else
        {
            progress.PercentageReading = percentageReading;
            progress.State = state;
            progress.CurrentPage = currentPage;
            progress.TotalPages = totalPages;
        }

        await unitOfWork.SaveChangesAsync(default);
    }

    public static async Task SetListCurrentWorkAsync(IntegrationTestFixture fixture, long userId, long workListId, long workId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var listProgress = await unitOfWork.ListReadingProgressRepository.GetByUserIdAndWorkListIdAsync(userId, workListId, default);
        if (listProgress is null)
        {
            var user = await unitOfWork.UserRepository.GetByIdAsync(userId, default)
                       ?? throw new InvalidOperationException("User does not exist.");
            var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default)
                       ?? throw new InvalidOperationException("Work does not exist.");
            var workList = await unitOfWork.WorkListRepository.GetByIdAsync(workListId, default)
                           ?? throw new InvalidOperationException("Work list does not exist.");

            listProgress = new ListReadingProgress
            {
                User = user,
                WorkList = workList,
                CurrentWork = work,
                LastReadAt = DateTimeOffset.UtcNow
            };
            await unitOfWork.ListReadingProgressRepository.AddAsync(listProgress, default);
        }
        else
        {
            await unitOfWork.ListReadingProgressRepository.UpdateAsync(listProgress, workId, default);
        }

        await unitOfWork.SaveChangesAsync(default);
    }

    public static async Task<long?> GetListCurrentWorkIdAsync(IntegrationTestFixture fixture, long userId, long workListId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var listProgress = await unitOfWork.ListReadingProgressRepository.GetByUserIdAndWorkListIdAsync(userId, workListId, default);
        return listProgress?.CurrentWork?.Id;
    }

    public static async Task<ListRating?> GetListRatingAsync(IntegrationTestFixture fixture, long userId, long workListId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        return await unitOfWork.ListRatingRepository.GetByUserIdAndWorkListIdAsync(userId, workListId, default);
    }

    public static async Task<(int RatingCount, double AverageRating)> ReadListAccumulatorsAsync(IntegrationTestFixture fixture, long workListId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var workList = await unitOfWork.WorkListRepository.GetByIdAsync(workListId, default);
        if (workList is null)
        {
            throw new InvalidOperationException($"Work list {workListId} no longer exists.");
        }

        return (workList.RatingCount, workList.AverageRating);
    }

    public static async Task CleanupAsync(IntegrationTestFixture fixture, ListTestContext context)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var listRatingRows = await dbContext.ListRatings
            .Where(rating => rating.WorkList != null && rating.WorkList.Id == context.WorkListId)
            .ToListAsync();
        dbContext.ListRatings.RemoveRange(listRatingRows);

        var listProgressRows = await dbContext.ListReadingProgresses
            .Where(progress => progress.WorkList != null && progress.WorkList.Id == context.WorkListId)
            .ToListAsync();
        dbContext.ListReadingProgresses.RemoveRange(listProgressRows);

        if (context.WorkIds.Count > 0)
        {
            var progressRows = await dbContext.WorkReadingProgresses
                .Where(progress => progress.Work != null && context.WorkIds.Contains(progress.Work.Id))
                .ToListAsync();
            dbContext.WorkReadingProgresses.RemoveRange(progressRows);

            var workRatingRows = await dbContext.WorkRatings
                .Where(rating => rating.Work != null && context.WorkIds.Contains(rating.Work.Id))
                .ToListAsync();
            dbContext.WorkRatings.RemoveRange(workRatingRows);
        }

        var items = await dbContext.WorkListItems
            .Where(item => item.WorkList != null && item.WorkList.Id == context.WorkListId)
            .ToListAsync();
        dbContext.WorkListItems.RemoveRange(items);

        var workList = await dbContext.WorkLists.FirstOrDefaultAsync(list => list.Id == context.WorkListId);
        if (workList is not null)
        {
            dbContext.WorkLists.Remove(workList);
        }

        if (context.WorkIds.Count > 0)
        {
            var works = await dbContext.Works.Where(work => context.WorkIds.Contains(work.Id)).ToListAsync();
            dbContext.Works.RemoveRange(works);
        }

        await dbContext.SaveChangesAsync();
    }
}

internal sealed record ListTestContext(
        long WorkListId,
        long UserId,
        long WorkId1,
        long WorkId2,
        IReadOnlyList<long> WorkIds);
