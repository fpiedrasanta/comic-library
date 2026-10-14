using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class RecommendedWorksIntegrationTests
{
    // Controlled dataset seeded in the development database (see the execution result of TASK-API-0299).
    // rec.user6 is the querying user: it has progress only on the excluded works.
    private const string QueryingUserEmail = "rec.user6@comiclibrary.test";

    private const long PopularWorkId = 2;            // 5 users at 97% each, weighted sum 485
    private const long SingleCompletionWorkId = 22;  // 1 user at 100% and 2 users at 1%, weighted sum 102
    private const long CompletionOnlyWorkId = 21;    // 1 user at 100%, weighted sum 100
    private const long ExcludedPageOneWorkId = 18;   // querying user at page 1 (0%) plus 5 users at 100%
    private const long ExcludedCompletedWorkId = 19; // querying user completed plus 5 users at 100%
    private const long OtherUserReadWorkId = 20;     // only another user read it, eligible for the querying user
    private const long HighlyRatedWorkId = 17;       // active ratings of 5 and 4 stars, average 4.5
    private const long ZeroRatedWorkId = 10;         // active rating of 0 stars, average 0
    private const long UnratedWorkId = 12;           // no ratings

    private static readonly long[] ControlledWorkIds =
    {
        PopularWorkId, SingleCompletionWorkId, CompletionOnlyWorkId, ExcludedPageOneWorkId,
        ExcludedCompletedWorkId, OtherUserReadWorkId, HighlyRatedWorkId, ZeroRatedWorkId, UnratedWorkId
    };

    private readonly IntegrationTestFixture _fixture;

    public RecommendedWorksIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetRecommended_MostPopular_OrdersByWeightedReadingProgress()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var ids = (await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.MostPopular, default)).Select(item => item.Id).ToList();

        Assert.True(ids.IndexOf(PopularWorkId) >= 0, "the most read work must appear in the recommendations");
        Assert.True(ids.IndexOf(PopularWorkId) < ids.IndexOf(SingleCompletionWorkId), "the work with the highest weighted reading progress must come first");

        if (ids.Contains(CompletionOnlyWorkId))
        {
            Assert.True(ids.IndexOf(SingleCompletionWorkId) < ids.IndexOf(CompletionOnlyWorkId), "more reading activity must outrank a single completion");
        }

        var sums = await ReadProgressMetricsAsync(new[] { PopularWorkId, SingleCompletionWorkId, CompletionOnlyWorkId });
        Assert.True(sums[PopularWorkId].Sum > sums[SingleCompletionWorkId].Sum, $"expected {PopularWorkId} ({sums[PopularWorkId].Sum}) above {SingleCompletionWorkId} ({sums[SingleCompletionWorkId].Sum})");
        Assert.True(sums[SingleCompletionWorkId].Sum > sums[CompletionOnlyWorkId].Sum, $"expected {SingleCompletionWorkId} ({sums[SingleCompletionWorkId].Sum}) above {CompletionOnlyWorkId} ({sums[CompletionOnlyWorkId].Sum})");

        AssertMatchesExpectedOrder(ids, await ComputeExpectedOrderAsync(user.Id, RecommendedSortFields.MostPopular));

        Assert.Empty(dbContext.ChangeTracker.Entries<Work>());
    }

    [Fact]
    public async Task GetRecommended_ExcludesWorksTheUserAlreadyRead_IncludingPageOne()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        var ids = (await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.MostPopular, default)).Select(item => item.Id).ToList();

        Assert.DoesNotContain(ExcludedPageOneWorkId, ids);
        Assert.DoesNotContain(ExcludedCompletedWorkId, ids);
        Assert.Contains(OtherUserReadWorkId, ids);
    }

    [Fact]
    public async Task GetRecommended_MostRated_OrdersByAverageWithZeroStarVotesAndUnratedWorksLast()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        var ids = (await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.MostRated, default)).Select(item => item.Id).ToList();

        Assert.True(ids.IndexOf(HighlyRatedWorkId) >= 0, "the best rated work must appear in the recommendations");
        Assert.True(ids.IndexOf(HighlyRatedWorkId) < ids.IndexOf(ZeroRatedWorkId), "the better rated work must come first");

        AssertMatchesExpectedOrder(ids, await ComputeExpectedOrderAsync(user.Id, RecommendedSortFields.MostRated));
    }

    [Fact]
    public async Task GetRecommended_ReturnsAtMostTwelveEligibleWorks()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        var result = await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.MostPopular, default);

        var expected = await ComputeExpectedOrderAsync(user.Id, RecommendedSortFields.MostPopular);

        Assert.Equal(Math.Min(Application.Constants.RecommendedWorks.MaxResults, expected.Count), result.Count);
        AssertMatchesExpectedOrder(result.Select(item => item.Id).ToList(), expected);
    }

    [Fact]
    public async Task GetRecommended_RecentlyAdded_OrdersByCreationDateDescending()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        var ids = (await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.RecentlyAdded, default)).Select(item => item.Id).ToList();

        AssertMatchesExpectedOrder(ids, await ComputeExpectedOrderAsync(user.Id, RecommendedSortFields.RecentlyAdded));
    }

    [Fact]
    public async Task GetRecommended_ExcludesInactiveWorks()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var work = await unitOfWork.WorkRepository.GetByIdAsync(UnratedWorkId, default);
        work!.IsActive = false;
        await unitOfWork.SaveChangesAsync(default);

        try
        {
            var ids = (await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.RecentlyAdded, default)).Select(item => item.Id).ToList();

            Assert.DoesNotContain(UnratedWorkId, ids);
        }
        finally
        {
            var workToRestore = await unitOfWork.WorkRepository.GetByIdAsync(UnratedWorkId, default);
            workToRestore!.IsActive = true;
            await unitOfWork.SaveChangesAsync(default);
        }
    }

    [Fact]
    public async Task GetRecommended_ReflectsProgressWrittenByTheService()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);
        var eligibleWork = await PickEligibleWorkOutsideControlledSetAsync(user.Id);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var works = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        await works.UpdateReadingProgressAsync(eligibleWork, user.Id, 3, default);

        var ids = (await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.MostPopular, default)).Select(item => item.Id).ToList();

        Assert.DoesNotContain(eligibleWork, ids);
    }

    [Fact]
    public async Task GetRecommended_ReturnsWorkCardDataWithoutExtraQueries()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var result = await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.RecentlyAdded, default);

        Assert.NotEmpty(result);
        Assert.All(result, item =>
        {
            Assert.False(string.IsNullOrWhiteSpace(item.Title));
            Assert.Null(item.MyReadingProgress);
        });

        Assert.Empty(dbContext.ChangeTracker.Entries<Work>());
        Assert.Empty(dbContext.ChangeTracker.Entries<WorkReadingProgress>());
    }

    [Fact]
    public async Task GetRecommended_DefaultCriterionIsMostPopular()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        var withoutCriterion = await recommended.GetRecommendedAsync(user.Id, null, default);
        var emptyCriterion = await recommended.GetRecommendedAsync(user.Id, "   ", default);
        var lowerCaseCriterion = await recommended.GetRecommendedAsync(user.Id, "mostpopular", default);
        var mostPopular = await recommended.GetRecommendedAsync(user.Id, RecommendedSortFields.MostPopular, default);

        Assert.Equal(mostPopular.Select(item => item.Id).ToList(), withoutCriterion.Select(item => item.Id).ToList());
        Assert.Equal(mostPopular.Select(item => item.Id).ToList(), emptyCriterion.Select(item => item.Id).ToList());
        Assert.Equal(mostPopular.Select(item => item.Id).ToList(), lowerCaseCriterion.Select(item => item.Id).ToList());
    }

    [Theory]
    [InlineData("foo")]
    [InlineData("popular")]
    public async Task GetRecommended_InvalidCriterion_ThrowsValidationException(string sortBy)
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var recommended = scope.ServiceProvider.GetRequiredService<IRecommendedWorksService>();

        await Assert.ThrowsAsync<ValidationException>(() => recommended.GetRecommendedAsync(user.Id, sortBy, default));
    }

    [Fact]
    public async Task GetRecommendedByRepository_AppliesFilterOrderAndLimitInDatabase()
    {
        var user = await FindUserByEmailAsync(QueryingUserEmail);

        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var works = await unitOfWork.WorkRepository.GetRecommendedAsync(user.Id, RecommendedSortFields.MostPopular, default);

        Assert.True(works.Count <= Application.Constants.RecommendedWorks.MaxResults);
        Assert.DoesNotContain(works, work => work.Id == ExcludedPageOneWorkId);
        Assert.DoesNotContain(works, work => work.Id == ExcludedCompletedWorkId);
        Assert.All(works, work => Assert.True(work.IsActive));
        Assert.All(works, work => Assert.False(string.IsNullOrWhiteSpace(work.Title)));
    }

    private async Task<User> FindUserByEmailAsync(string email)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var (users, _) = await unitOfWork.UserRepository.GetPagedAsync(
            new GetUsersRequest { currentPage = 1, pageSize = 50, IsActive = true },
            default);

        var user = users.FirstOrDefault(candidate => string.Equals(candidate.Email, email, StringComparison.OrdinalIgnoreCase));

        if (user is null)
        {
            throw new InvalidOperationException($"The controlled dataset user {email} does not exist in the development database.");
        }

        return user;
    }

    private async Task<long> PickEligibleWorkOutsideControlledSetAsync(long userId)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var workIds = await ReadCatalogWorkIdsAsync(service);
        var progresses = await unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(workIds, userId, default);
        var readWorks = progresses.Select(progress => progress.Work!.Id).ToHashSet();

        var candidate = workIds.FirstOrDefault(id => !readWorks.Contains(id) && !ControlledWorkIds.Contains(id));

        if (candidate == 0)
        {
            throw new InvalidOperationException("The development database has no eligible work outside the controlled dataset.");
        }

        return candidate;
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
                .OrderByDescending(work => progressMetrics.TryGetValue(work.Id, out var metric) ? metric.Sum : 0)
                .ThenByDescending(work => work.CreatedAt)
                .ThenByDescending(work => work.Id)
        };

        return ordered.Select(work => work.Id).Take(Application.Constants.RecommendedWorks.MaxResults).ToList();
    }

    private static void AssertMatchesExpectedOrder(List<long> actual, List<long> expected)
    {
        Assert.Equal(expected, actual);
    }
}
