using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class WorkRatingRepositoryIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public WorkRatingRepositoryIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsTrackedEntity_WithLazyLoadedNavigations()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var createdAt = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc);
        var ratingIds = new List<long>();

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var unitOfWork = setupScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);
            var rating = new WorkRating
            {
                Work = work!,
                User = await GetTrackedUserAsync(unitOfWork, users[0]),
                Stars = 3,
                Review = "Tracked entity",
                CreatedAt = createdAt,
                IsActive = true
            };

            await unitOfWork.WorkRatingRepository.AddAsync(rating, default);
            await unitOfWork.SaveChangesAsync(default);
            ratingIds.Add(rating.Id);
        }

        try
        {
            using var scope = _fixture.ScopeFactory.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var rating = await unitOfWork.WorkRatingRepository.GetByIdAsync(ratingIds[0], default);

            Assert.NotNull(rating);
            Assert.Equal(ratingIds[0], rating!.Id);
            Assert.False(string.IsNullOrWhiteSpace(rating.User.FirstName));
            Assert.Equal(users[0].Id, rating.User.Id);
            Assert.Equal(workId, rating.Work.Id);

            rating.Stars = 5;
            await unitOfWork.WorkRatingRepository.UpdateAsync(rating, default);
            await unitOfWork.SaveChangesAsync(default);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }

        var rowStillExists = false;
        using (var verifyScope = _fixture.ScopeFactory.CreateScope())
        {
            var dbContext = verifyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            rowStillExists = await dbContext.WorkRatings.AsNoTracking().AnyAsync(rating => rating.Id == ratingIds[0], default);
        }

        Assert.False(rowStillExists);
    }

    [Fact]
    public async Task GetByUserIdAndWorkIdAsync_ReturnsRatingOfThePair_AndNullForOtherCombinations()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var createdAt = new DateTime(2026, 2, 10, 9, 30, 0, DateTimeKind.Utc);
        var ratingIds = new List<long>();

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var unitOfWork = setupScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);
            var rating = new WorkRating
            {
                Work = work!,
                User = await GetTrackedUserAsync(unitOfWork, users[0]),
                Stars = 4,
                CreatedAt = createdAt,
                IsActive = true
            };

            await unitOfWork.WorkRatingRepository.AddAsync(rating, default);
            await unitOfWork.SaveChangesAsync(default);
            ratingIds.Add(rating.Id);
        }

        try
        {
            var found = await WorkRatingTestSupport.GetRatingAsync(_fixture, users[0].Id, workId);
            var missingUser = await WorkRatingTestSupport.GetRatingAsync(_fixture, users[1].Id, workId);

            Assert.NotNull(found);
            Assert.Equal(4, found!.Stars);
            Assert.Equal(ratingIds[0], found.Id);

            Assert.Null(missingUser);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task GetPagedByWorkIdAsync_OrdersByBothFieldsInBothDirections_WithIdTieBreaker()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 5);

        var expected = new (int Stars, DateTime CreatedAt)[]
        {
            (5, new DateTime(2026, 3, 1, 8, 0, 0, DateTimeKind.Utc)),
            (0, new DateTime(2026, 3, 2, 8, 0, 0, DateTimeKind.Utc)),
            (3, new DateTime(2026, 3, 3, 8, 0, 0, DateTimeKind.Utc)),
            (3, new DateTime(2026, 3, 3, 8, 0, 0, DateTimeKind.Utc)),
            (4, new DateTime(2026, 3, 4, 8, 0, 0, DateTimeKind.Utc))
        };

        var ratingIds = new List<long>();

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var unitOfWork = setupScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);
            var trackedUsers = new List<User>();

            foreach (var selectedUser in users)
            {
                trackedUsers.Add(await GetTrackedUserAsync(unitOfWork, selectedUser));
            }

            for (var i = 0; i < expected.Length; i++)
            {
                var rating = new WorkRating
                {
                    Work = work!,
                    User = trackedUsers[i],
                    Stars = expected[i].Stars,
                    Review = expected[i].Stars == 0 ? null : $"Review {i}",
                    CreatedAt = expected[i].CreatedAt,
                    IsActive = true
                };

                await unitOfWork.WorkRatingRepository.AddAsync(rating, default);
                await unitOfWork.SaveChangesAsync(default);
                ratingIds.Add(rating.Id);
            }
        }

        try
        {
            var result = await GetPageAsync(workId, orderBy: WorkRatingSortFields.Stars, orderDir: SortDirection.DESC);
            var ascending = await GetPageAsync(workId, orderBy: WorkRatingSortFields.Stars, orderDir: SortDirection.ASC);

            Assert.Equal(5, result.totalCount);
            Assert.Equal(new[] { 5, 4, 3, 3, 0 }, result.items.Select(item => item.Stars).ToArray());
            Assert.Equal(new[] { 0, 3, 3, 4, 5 }, ascending.items.Select(item => item.Stars).ToArray());

            AssertTieBreakById(result.items, item => item.Stars == 3);
            AssertTieBreakById(ascending.items, item => item.Stars == 3);

            var newestFirst = await GetPageAsync(workId, orderBy: WorkRatingSortFields.CreatedAt, orderDir: SortDirection.DESC);
            var oldestFirst = await GetPageAsync(workId, orderBy: WorkRatingSortFields.CreatedAt, orderDir: SortDirection.ASC);

            var withCreatedAt = ratingIds.Select((id, index) => (id, createdAt: expected[index].CreatedAt)).ToList();
            var expectedOldestFirst = withCreatedAt
                .OrderBy(entry => entry.createdAt)
                .ThenBy(entry => entry.id)
                .Select(entry => entry.id)
                .ToList();
            var expectedNewestFirst = withCreatedAt
                .OrderByDescending(entry => entry.createdAt)
                .ThenBy(entry => entry.id)
                .Select(entry => entry.id)
                .ToList();

            Assert.Equal(expectedOldestFirst, oldestFirst.items.Select(item => item.Id).ToList());
            Assert.Equal(expectedNewestFirst, newestFirst.items.Select(item => item.Id).ToList());

            Assert.All(result.items.Where(item => item.Stars == 0), item => Assert.Null(item.Review));
            Assert.Equal(2, result.items.Count(item => item.Stars == 3));
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task GetPagedByWorkIdAsync_OnlyReturnsRatingsOfTheRequestedWork()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 2);

        var firstWorkId = workIds[0];
        var secondWorkId = workIds[1];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var ratingIds = new List<long>();

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var unitOfWork = setupScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var firstWork = await unitOfWork.WorkRepository.GetByIdAsync(firstWorkId, default);
            var secondWork = await unitOfWork.WorkRepository.GetByIdAsync(secondWorkId, default);

            var firstRating = new WorkRating
            {
                Work = firstWork!,
                User = await GetTrackedUserAsync(unitOfWork, users[0]),
                Stars = 4,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var secondRating = new WorkRating
            {
                Work = secondWork!,
                User = await GetTrackedUserAsync(unitOfWork, users[1]),
                Stars = 2,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await unitOfWork.WorkRatingRepository.AddAsync(firstRating, default);
            await unitOfWork.WorkRatingRepository.AddAsync(secondRating, default);
            await unitOfWork.SaveChangesAsync(default);

            ratingIds.Add(firstRating.Id);
            ratingIds.Add(secondRating.Id);
        }

        try
        {
            var firstWorkPage = await GetPageAsync(firstWorkId, orderBy: WorkRatingSortFields.Stars, orderDir: SortDirection.DESC);
            var secondWorkPage = await GetPageAsync(secondWorkId, orderBy: WorkRatingSortFields.Stars, orderDir: SortDirection.DESC);

            Assert.Single(firstWorkPage.items);
            Assert.Equal(users[0].Id, firstWorkPage.items[0].User.Id);
            Assert.Equal(4, firstWorkPage.items[0].Stars);

            Assert.Single(secondWorkPage.items);
            Assert.Equal(users[1].Id, secondWorkPage.items[0].User.Id);
            Assert.Equal(2, secondWorkPage.items[0].Stars);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, firstWorkId, ratingIds);
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, secondWorkId, ratingIds);
        }
    }

    [Fact]
    public async Task GetPagedByWorkIdAsync_ExcludesInactiveRatings()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 2);
        var ratingIds = new List<long>();

        using (var setupScope = _fixture.ScopeFactory.CreateScope())
        {
            var unitOfWork = setupScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);

            var activeRating = new WorkRating
            {
                Work = work!,
                User = await GetTrackedUserAsync(unitOfWork, users[0]),
                Stars = 5,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var inactiveRating = new WorkRating
            {
                Work = work!,
                User = await GetTrackedUserAsync(unitOfWork, users[1]),
                Stars = 1,
                CreatedAt = DateTime.UtcNow,
                IsActive = false
            };

            await unitOfWork.WorkRatingRepository.AddAsync(activeRating, default);
            await unitOfWork.WorkRatingRepository.AddAsync(inactiveRating, default);
            await unitOfWork.SaveChangesAsync(default);

            ratingIds.Add(activeRating.Id);
            ratingIds.Add(inactiveRating.Id);
        }

        try
        {
            var page = await GetPageAsync(workId, orderBy: WorkRatingSortFields.Stars, orderDir: SortDirection.DESC);

            Assert.Single(page.items);
            Assert.Equal(users[0].Id, page.items[0].User.Id);
            Assert.Equal(1, page.totalCount);
            Assert.DoesNotContain(page.items, item => item.User.Id == users[1].Id);
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    [Fact]
    public async Task UniqueConstraint_RejectsSecondRatingOfTheSameUserForTheSameWork()
    {
        var workIds = await WorkRatingTestSupport.PickActiveWorkIdsWithoutRatingsAsync(_fixture, 1);
        var workId = workIds[0];
        var users = await WorkRatingTestSupport.PickActiveUsersAsync(_fixture, 1);
        var ratingIds = new List<long>();

        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var work = await unitOfWork.WorkRepository.GetByIdAsync(workId, default);
        var user = await GetTrackedUserAsync(unitOfWork, users[0]);

        var firstRating = new WorkRating
        {
            Work = work!,
            User = user!,
            Stars = 4,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await unitOfWork.WorkRatingRepository.AddAsync(firstRating, default);
        await unitOfWork.SaveChangesAsync(default);
        ratingIds.Add(firstRating.Id);

        try
        {
            await unitOfWork.WorkRatingRepository.AddAsync(new WorkRating
            {
                Work = work!,
                User = user!,
                Stars = 2,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }, default);

            await Assert.ThrowsAsync<DbUpdateException>(() => unitOfWork.SaveChangesAsync(default));
        }
        finally
        {
            await WorkRatingTestSupport.CleanupRatingsAsync(_fixture, workId, ratingIds);
        }
    }

    private static async Task<User> GetTrackedUserAsync(IUnitOfWork unitOfWork, User selectedUser, CancellationToken cancellationToken = default)
    {
        var user = await unitOfWork.UserRepository.GetByIdAsync(selectedUser.Id, cancellationToken);
        Assert.NotNull(user);
        return user!;
    }

    private static void AssertTieBreakById(IReadOnlyList<WorkRating> items, Func<WorkRating, bool> isTied)
    {
        var tiedIds = items.Where(isTied).Select(item => item.Id).ToList();

        Assert.Equal(2, tiedIds.Count);
        Assert.Equal(tiedIds.OrderBy(id => id).ToList(), tiedIds);
    }

    private async Task<(IReadOnlyList<WorkRating> items, int totalCount)> GetPageAsync(
        long workId,
        string orderBy,
        string orderDir,
        int currentPage = 1,
        int pageSize = 50)
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        return await unitOfWork.WorkRatingRepository.GetPagedByWorkIdAsync(workId, currentPage, pageSize, orderBy, orderDir, default);
    }
}
