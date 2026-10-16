using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class RecommendedWorksIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public RecommendedWorksIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetRecommended_MostPopular_OrdersByWeightedReadingProgress()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97,
            singleCompletionReaders: 1, singleCompletionPercentage: 100,
            singleLowReaders: 2, singleLowPercentage: 1,
            completionOnlyReaders: 1, completionOnlyPercentage: 100);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var ids = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular, default))
                .Select(item => item.Id)
                .ToList();

            var myIds = ids.Intersect(scenario.CreatedWorkIds).ToList();

            Assert.Contains(scenario.PopularWorkId, myIds);
            Assert.True(myIds.IndexOf(scenario.PopularWorkId) < myIds.IndexOf(scenario.SingleCompletionWorkId));
            Assert.True(myIds.IndexOf(scenario.SingleCompletionWorkId) < myIds.IndexOf(scenario.CompletionOnlyWorkId));
            Assert.Contains(scenario.OtherUserReadWorkId, myIds);

            AssertMatchesExpectedOrder(myIds, (await ComputeExpectedOrderAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular)).Intersect(scenario.CreatedWorkIds).ToList());
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_ExcludesWorksTheUserAlreadyRead_IncludingPageOne()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            excludedPageOnePercentage: 39,
            excludedCompletedPercentage: 100);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var ids = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular, default))
                .Select(item => item.Id)
                .ToList();

            Assert.DoesNotContain(scenario.ExcludedPageOneWorkId, ids);
            Assert.DoesNotContain(scenario.ExcludedCompletedWorkId, ids);

            var readByQuery = await unitOfWork.WorkReadingProgressRepository
                .GetByWorkIdsAndUserIdAsync(scenario.CreatedWorkIds, scenario.QueryingUserId, default);
            var readWorks = readByQuery.Select(p => p.Work!.Id).ToHashSet();
            Assert.True(readWorks.Contains(scenario.ExcludedPageOneWorkId), "the querying user must have read the excluded page-one work");
            Assert.True(readWorks.Contains(scenario.ExcludedCompletedWorkId), "the querying user must have completed the excluded work");
            Assert.False(readWorks.Contains(scenario.OtherUserReadWorkId), "the querying user must not have read the other-user-read work, so it stays eligible");
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_MostRated_OrdersByAverageWithZeroStarVotesAndUnratedWorksLast()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            highlyRated: new[] { 5, 4 },
            zeroRated: new[] { 0 });

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var ids = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostRated, default))
                .Select(item => item.Id)
                .ToList();

            var myIds = ids.Intersect(scenario.CreatedWorkIds).ToList();

            Assert.Contains(scenario.HighlyRatedWorkId, myIds);
            Assert.True(myIds.IndexOf(scenario.HighlyRatedWorkId) < myIds.IndexOf(scenario.ZeroRatedWorkId));

            AssertMatchesExpectedOrder(myIds, (await ComputeExpectedOrderAsync(scenario.QueryingUserId, RecommendedSortFields.MostRated)).Intersect(scenario.CreatedWorkIds).ToList());
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_ReturnsAtMostTwelveEligibleWorks()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97,
            extraEligibleWorks: 20);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var result = await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular, default);
            var ids = result.Select(item => item.Id).ToList();
            var myIds = ids.Intersect(scenario.CreatedWorkIds).ToList();

            Assert.True(result.Count <= Application.Constants.RecommendedWorks.MaxResults);
            Assert.True(myIds.Contains(scenario.PopularWorkId), "the most-read created work must appear in the top recommendations");
            Assert.All(result, item => Assert.False(string.IsNullOrWhiteSpace(item.Title)));
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_RecentlyAdded_OrdersByCreationDateDescending()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            var ids = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.RecentlyAdded, default))
                .Select(item => item.Id)
                .ToList();

            var myIds = ids.Intersect(scenario.CreatedWorkIds).ToList();

            AssertMatchesExpectedOrder(myIds, (await ComputeExpectedOrderAsync(scenario.QueryingUserId, RecommendedSortFields.RecentlyAdded)).Intersect(scenario.CreatedWorkIds).ToList());
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_ExcludesInactiveWorks()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97,
            unratedWork: true);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var work = await unitOfWork.WorkRepository.GetByIdAsync(scenario.UnratedWorkId, default);
            work!.IsActive = false;
            await unitOfWork.SaveChangesAsync(default);

            try
            {
                var ids = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.RecentlyAdded, default))
                    .Select(item => item.Id)
                    .ToList();

                Assert.DoesNotContain(scenario.UnratedWorkId, ids);
            }
            finally
            {
                var workToRestore = await unitOfWork.WorkRepository.GetByIdAsync(scenario.UnratedWorkId, default);
                workToRestore!.IsActive = true;
                await unitOfWork.SaveChangesAsync(default);
            }
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_ReflectsProgressWrittenByTheService()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97,
            extraEligibleWorks: 3);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            await works.UpdateReadingProgressAsync(scenario.EligibleWorkIds[0], scenario.QueryingUserId, 3, default);

            var ids = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular, default))
                .Select(item => item.Id)
                .ToList();

            Assert.DoesNotContain(scenario.EligibleWorkIds[0], ids);
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_ReturnsWorkCardDataWithoutExtraQueries()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var result = await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.RecentlyAdded, default);

            Assert.NotEmpty(result);
            Assert.All(result, item =>
            {
                Assert.False(string.IsNullOrWhiteSpace(item.Title));
                Assert.Null(item.MyReadingProgress);
            });

            Assert.Empty(dbContext.ChangeTracker.Entries<Work>());
            Assert.Empty(dbContext.ChangeTracker.Entries<WorkReadingProgress>());
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommended_DefaultCriterionIsMostPopular()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var mostPopular = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular, default))
                .Select(item => item.Id).Intersect(scenario.CreatedWorkIds).ToList();
            var withoutCriterion = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, null, default))
                .Select(item => item.Id).Intersect(scenario.CreatedWorkIds).ToList();
            var emptyCriterion = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, "   ", default))
                .Select(item => item.Id).Intersect(scenario.CreatedWorkIds).ToList();
            var lowerCaseCriterion = (await recommended.GetRecommendedAsync(scenario.QueryingUserId, "mostpopular", default))
                .Select(item => item.Id).Intersect(scenario.CreatedWorkIds).ToList();

            Assert.Equal(mostPopular, withoutCriterion);
            Assert.Equal(mostPopular, emptyCriterion);
            Assert.Equal(mostPopular, lowerCaseCriterion);
            Assert.Empty(dbContext.ChangeTracker.Entries<Work>());
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Theory]
    [InlineData("foo")]
    [InlineData("popular")]
    public async Task GetRecommended_InvalidCriterion_ThrowsValidationException(string sortBy)
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

            await Assert.ThrowsAsync<ValidationException>(() => recommended.GetRecommendedAsync(scenario.QueryingUserId, sortBy, default));
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    [Fact]
    public async Task GetRecommendedByRepository_AppliesFilterOrderAndLimitInDatabase()
    {
        var scenario = await CreateRecommendedScenarioAsync(
            popularReaders: 5, popularPercentage: 97,
            excludedPageOnePercentage: 39,
            excludedCompletedPercentage: 100,
            excludedOtherReaders: 1,
            extraEligibleWorks: 3);

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var works = await unitOfWork.WorkRepository.GetRecommendedAsync(scenario.QueryingUserId, RecommendedSortFields.MostPopular, default);

            Assert.True(works.Count <= Application.Constants.RecommendedWorks.MaxResults);
            Assert.DoesNotContain(works, work => work.Id == scenario.ExcludedPageOneWorkId);
            Assert.DoesNotContain(works, work => work.Id == scenario.ExcludedCompletedWorkId);
            Assert.All(works, work => Assert.True(work.IsActive));
            Assert.All(works, work => Assert.False(string.IsNullOrWhiteSpace(work.Title)));
        }
        finally
        {
            await scenario.CleanUpAsync();
        }
    }

    private async Task<RecommendedScenario> CreateRecommendedScenarioAsync(
        int popularReaders = 0,
        int popularPercentage = 0,
        int singleCompletionReaders = 0,
        int singleCompletionPercentage = 100,
        int singleLowReaders = 0,
        int singleLowPercentage = 1,
        int completionOnlyReaders = 0,
        int completionOnlyPercentage = 100,
        int? excludedPageOnePercentage = null,
        int? excludedCompletedPercentage = null,
        int excludedOtherReaders = 1,
        int[]? highlyRated = null,
        int[]? zeroRated = null,
        bool unratedWork = false,
        int extraEligibleWorks = 0)
    {
        var neededOtherUsers = popularReaders
            + singleCompletionReaders + singleLowReaders
            + completionOnlyReaders + 1
            + (excludedPageOnePercentage.HasValue ? excludedOtherReaders : 0)
            + (excludedCompletedPercentage.HasValue ? excludedOtherReaders : 0)
            + (highlyRated?.Length > 0 ? highlyRated.Length : 0)
            + (zeroRated?.Length > 0 ? zeroRated.Length : 0);

        var allUsers = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1 + Math.Max(neededOtherUsers, 1));
        var queryingUser = allUsers[0];
        var otherUsers = allUsers.Skip(1).ToArray();
        var readerIndex = 0;
        long NextReaderId() => otherUsers[readerIndex++].Id;

        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var workRatingService = scope.ServiceProvider.GetRequiredService<IWorkRatingService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var workType = await dbContext.WorkTypes.FirstAsync();
        var language = await dbContext.Languages.FirstAsync();

        var popularWork = CreateWork($"rec-popular {Guid.NewGuid():N}", workType, language);
        await unitOfWork.WorkRepository.AddAsync(popularWork, default);

        var singleCompletionWork = CreateWork($"rec-single-completion {Guid.NewGuid():N}", workType, language);
        await unitOfWork.WorkRepository.AddAsync(singleCompletionWork, default);

        var completionOnlyWork = CreateWork($"rec-completion-only {Guid.NewGuid():N}", workType, language);
        await unitOfWork.WorkRepository.AddAsync(completionOnlyWork, default);

        var excludedPageOneWork = excludedPageOnePercentage.HasValue
            ? CreateWork($"rec-excluded-page1 {Guid.NewGuid():N}", workType, language)
            : null;
        if (excludedPageOneWork is not null)
        {
            await unitOfWork.WorkRepository.AddAsync(excludedPageOneWork, default);
        }

        var excludedCompletedWork = excludedCompletedPercentage.HasValue
            ? CreateWork($"rec-excluded-completed {Guid.NewGuid():N}", workType, language)
            : null;
        if (excludedCompletedWork is not null)
        {
            await unitOfWork.WorkRepository.AddAsync(excludedCompletedWork, default);
        }

        var otherUserReadWork = CreateWork($"rec-other-user-read {Guid.NewGuid():N}", workType, language);
        await unitOfWork.WorkRepository.AddAsync(otherUserReadWork, default);

        var highlyRatedWork = highlyRated?.Length > 0
            ? CreateWork($"rec-highly-rated {Guid.NewGuid():N}", workType, language)
            : null;
        if (highlyRatedWork is not null)
        {
            await unitOfWork.WorkRepository.AddAsync(highlyRatedWork, default);
        }

        var zeroRatedWork = zeroRated?.Length > 0
            ? CreateWork($"rec-zero-rated {Guid.NewGuid():N}", workType, language)
            : null;
        if (zeroRatedWork is not null)
        {
            await unitOfWork.WorkRepository.AddAsync(zeroRatedWork, default);
        }

        Work? unratedWorkEntity = unratedWork
            ? CreateWork($"rec-unrated {Guid.NewGuid():N}", workType, language)
            : null;
        if (unratedWorkEntity is not null)
        {
            await unitOfWork.WorkRepository.AddAsync(unratedWorkEntity, default);
        }

        var extraWorks = new List<Work>();
        for (var i = 0; i < extraEligibleWorks; i++)
        {
            var extra = CreateWork($"rec-extra {Guid.NewGuid():N}", workType, language);
            extraWorks.Add(extra);
            await unitOfWork.WorkRepository.AddAsync(extra, default);
        }

        await unitOfWork.SaveChangesAsync(default);

        for (var i = 0; i < popularReaders; i++)
        {
            await SetReadingProgressAsync(_fixture, popularWork.Id, NextReaderId(), popularPercentage, 5, 10);
        }

        for (var i = 0; i < singleCompletionReaders; i++)
        {
            await SetReadingProgressAsync(_fixture, singleCompletionWork.Id, NextReaderId(), singleCompletionPercentage, 10, 10);
        }

        for (var i = 0; i < singleLowReaders; i++)
        {
            await SetReadingProgressAsync(_fixture, singleCompletionWork.Id, NextReaderId(), singleLowPercentage, 1, 10);
        }

        for (var i = 0; i < completionOnlyReaders; i++)
        {
            await SetReadingProgressAsync(_fixture, completionOnlyWork.Id, NextReaderId(), completionOnlyPercentage, 10, 10);
        }

        await SetReadingProgressAsync(_fixture, otherUserReadWork.Id, NextReaderId(), 100, 10, 10);

        if (excludedPageOneWork is not null && excludedPageOnePercentage.HasValue)
        {
            await SetReadingProgressAsync(_fixture, excludedPageOneWork.Id, queryingUser.Id, excludedPageOnePercentage.Value, 1, 10);
            for (var i = 0; i < excludedOtherReaders; i++)
            {
                await SetReadingProgressAsync(_fixture, excludedPageOneWork.Id, NextReaderId(), 100, 10, 10);
            }
        }

        if (excludedCompletedWork is not null && excludedCompletedPercentage.HasValue)
        {
            await SetReadingProgressAsync(_fixture, excludedCompletedWork.Id, queryingUser.Id, 100, 10, 10);
            for (var i = 0; i < excludedOtherReaders; i++)
            {
                await SetReadingProgressAsync(_fixture, excludedCompletedWork.Id, NextReaderId(), 100, 10, 10);
            }
        }

        if (highlyRatedWork is not null && highlyRated?.Length > 0)
        {
            foreach (var stars in highlyRated)
            {
                await workRatingService.CreateOrUpdateAsync(highlyRatedWork.Id, NextReaderId(), stars, null, default);
            }
        }

        if (zeroRatedWork is not null && zeroRated?.Length > 0)
        {
            await workRatingService.CreateOrUpdateAsync(zeroRatedWork.Id, NextReaderId(), zeroRated[0], null, default);
        }

        var createdWorkIds = new List<long>
        {
            popularWork.Id,
            singleCompletionWork.Id,
            completionOnlyWork.Id,
            otherUserReadWork.Id
        };
        if (excludedPageOneWork is not null) createdWorkIds.Add(excludedPageOneWork.Id);
        if (excludedCompletedWork is not null) createdWorkIds.Add(excludedCompletedWork.Id);
        if (highlyRatedWork is not null) createdWorkIds.Add(highlyRatedWork.Id);
        if (zeroRatedWork is not null) createdWorkIds.Add(zeroRatedWork.Id);
        if (unratedWorkEntity is not null) createdWorkIds.Add(unratedWorkEntity.Id);
        createdWorkIds.AddRange(extraWorks.Select(work => work.Id));

        return new RecommendedScenario(_fixture, createdWorkIds.ToArray())
        {
            QueryingUserId = queryingUser.Id,
            PopularWorkId = popularWork.Id,
            SingleCompletionWorkId = singleCompletionWork.Id,
            CompletionOnlyWorkId = completionOnlyWork.Id,
            ExcludedPageOneWorkId = excludedPageOneWork?.Id ?? 0,
            ExcludedCompletedWorkId = excludedCompletedWork?.Id ?? 0,
            OtherUserReadWorkId = otherUserReadWork.Id,
            HighlyRatedWorkId = highlyRatedWork?.Id ?? 0,
            ZeroRatedWorkId = zeroRatedWork?.Id ?? 0,
            UnratedWorkId = unratedWorkEntity?.Id ?? 0,
            EligibleWorkIds = extraWorks.Select(work => work.Id).ToArray()
        };
    }

    private static Work CreateWork(string title, WorkType workType, Language language) => new()
    {
        Title = title,
        WorkType = workType,
        Language = language,
        IsActive = true,
        ContentStatus = ContentStatus.Missing,
        CreatedAt = DateTime.UtcNow
    };

    private static async Task SetReadingProgressAsync(
        IntegrationTestFixture fixture,
        long workId,
        long userId,
        int percentageReading,
        int currentPage = 1,
        int totalPages = 10)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var work = await dbContext.Works.FirstAsync(w => w.Id == workId);
        var user = await dbContext.Users.FirstAsync(u => u.Id == userId);

        var progress = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, default);
        if (progress is null)
        {
            progress = new WorkReadingProgress
            {
                Work = work,
                User = user,
                CurrentPage = currentPage,
                TotalPages = totalPages,
                PercentageReading = percentageReading,
                LastReadAt = DateTimeOffset.UtcNow,
                State = percentageReading >= 100 ? ReadingState.Completed : ReadingState.Reading
            };
            await unitOfWork.WorkReadingProgressRepository.AddAsync(progress, default);
        }
        else
        {
            progress.PercentageReading = percentageReading;
            progress.CurrentPage = currentPage;
            progress.TotalPages = totalPages;
            progress.LastReadAt = DateTimeOffset.UtcNow;
            progress.State = percentageReading >= 100 ? ReadingState.Completed : ReadingState.Reading;
        }

        await unitOfWork.SaveChangesAsync(default);
    }

    private static async Task CleanUpAllCreatedWorksAsync(IntegrationTestFixture fixture, long[] createdWorkIds)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var progresses = await dbContext.WorkReadingProgresses
            .Where(progress => progress.Work != null && createdWorkIds.Contains(progress.Work.Id))
            .ToListAsync();
        dbContext.WorkReadingProgresses.RemoveRange(progresses);

        var ratings = await dbContext.WorkRatings
            .Where(rating => rating.Work != null && createdWorkIds.Contains(rating.Work.Id))
            .ToListAsync();
        dbContext.WorkRatings.RemoveRange(ratings);

        var works = await dbContext.Works.Where(work => createdWorkIds.Contains(work.Id)).ToListAsync();
        dbContext.Works.RemoveRange(works);

        await dbContext.SaveChangesAsync();
    }

    private static void AssertMatchesExpectedOrder(List<long> actual, List<long> expected)
    {
        Assert.Equal(expected, actual);
    }

    private async Task<List<long>> ComputeExpectedOrderAsync(long userId, string sortBy)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();

        var workIds = await ReadCatalogWorkIdsAsync(service);
        var progresses = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(workIds, userId, default);
        var readWorks = progresses.Select(progress => progress.Work!.Id).ToHashSet();

        var eligible = await dbContext.Works
            .AsNoTracking()
            .Where(work => work.IsActive && !readWorks.Contains(work.Id))
            .Select(work => new { work.Id, work.CreatedAt })
            .ToListAsync(default);

        var eligibleIds = eligible.Select(work => work.Id).ToList();

        if (eligibleIds.Count == 0)
        {
            return new List<long>();
        }

        var progressMetrics = await ReadProgressMetricsAsync(eligibleIds);
        var averages = await ReadAverageRatingsAsync(eligibleIds);

        var ordered = sortBy switch
        {
            RecommendedSortFields.MostRated => eligible
                .OrderByDescending(work => averages.ContainsKey(work.Id))
                .ThenByDescending(work => averages.TryGetValue(work.Id, out var average) ? average : 0)
                .ThenByDescending(work => work.CreatedAt)
                .ThenByDescending(work => work.Id),
            RecommendedSortFields.RecentlyAdded => eligible
                .OrderByDescending(work => work.CreatedAt)
                .ThenByDescending(work => work.Id),
            _ => eligible
                .OrderByDescending(work => progressMetrics.TryGetValue(work.Id, out var metric) ? (int?)metric.Sum : null)
                .ThenByDescending(work => work.CreatedAt)
                .ThenByDescending(work => work.Id)
        };

        return ordered.Select(work => work.Id).Take(Application.Constants.RecommendedWorks.MaxResults).ToList();
    }

    private static async Task<List<long>> ReadCatalogWorkIdsAsync(IWorkService service)
    {
        var ids = new List<long>();
        var currentPage = 1;

        while (true)
        {
            var page = await service.GetCatalogPagedAsync(new GetCatalogWorksRequest { currentPage = currentPage, pageSize = 50 }, null, default);

            ids.AddRange(page.Items.Select(item => item.Id));

            if (!page.HasNextPage)
            {
                break;
            }

            currentPage++;
        }

        return ids;
    }

    private async Task<Dictionary<long, (int Readers, int Sum)>> ReadProgressMetricsAsync(IReadOnlyCollection<long> workIds)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var rows = await dbContext.WorkReadingProgresses
            .AsNoTracking()
            .Where(progress => progress.Work != null && workIds.Contains(progress.Work.Id))
            .Select(progress => new { WorkId = progress.Work!.Id, progress.PercentageReading })
            .ToListAsync(default);

        return rows
            .GroupBy(row => row.WorkId)
            .ToDictionary(
                group => group.Key,
                group => (Readers: group.Count(row => row.PercentageReading > 0), Sum: group.Sum(row => row.PercentageReading)));
    }

    private async Task<Dictionary<long, double>> ReadAverageRatingsAsync(IReadOnlyCollection<long> workIds)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var rows = await dbContext.WorkRatings
            .AsNoTracking()
            .Where(rating => rating.Work != null && workIds.Contains(rating.Work.Id) && rating.IsActive)
            .Select(rating => new { WorkId = rating.Work!.Id, rating.Stars })
            .ToListAsync(default);

        return rows
            .GroupBy(row => row.WorkId)
            .ToDictionary(group => group.Key, group => group.Average(row => (double)row.Stars));
    }

    private sealed class RecommendedScenario
    {
        private readonly IntegrationTestFixture _fixture;
        private readonly long[] _createdWorkIds;

        public RecommendedScenario(IntegrationTestFixture fixture, long[] createdWorkIds)
        {
            _fixture = fixture;
            _createdWorkIds = createdWorkIds;
        }

        public long QueryingUserId { get; set; }
        public long PopularWorkId { get; set; }
        public long SingleCompletionWorkId { get; set; }
        public long CompletionOnlyWorkId { get; set; }
        public long ExcludedPageOneWorkId { get; set; }
        public long ExcludedCompletedWorkId { get; set; }
        public long OtherUserReadWorkId { get; set; }
        public long HighlyRatedWorkId { get; set; }
        public long ZeroRatedWorkId { get; set; }
        public long UnratedWorkId { get; set; }
        public long[] EligibleWorkIds { get; set; } = Array.Empty<long>();
        public long[] CreatedWorkIds => _createdWorkIds;

        public Task CleanUpAsync() => CleanUpAllCreatedWorksAsync(_fixture, _createdWorkIds);
    }
}
