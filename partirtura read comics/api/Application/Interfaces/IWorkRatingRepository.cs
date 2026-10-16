using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkRatingRepository
{
    Task<WorkRating?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<WorkRating?> GetByUserIdAndWorkIdAsync(long userId, long workId, CancellationToken cancellationToken = default);
    Task<Dictionary<long, WorkRating>> GetByUserIdAndWorkIdsAsync(long userId, IEnumerable<long> workIds, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<WorkRating> Items, int TotalCount)> GetPagedByWorkIdAsync(long workId, int currentPage, int pageSize, string? orderBy, string orderDir, CancellationToken cancellationToken = default);
    Task AddAsync(WorkRating rating, CancellationToken cancellationToken = default);
    Task UpdateAsync(WorkRating rating, CancellationToken cancellationToken = default);
    void Detach(WorkRating rating);
    Task ApplyNewVoteToWorkAccumulatorsAsync(long workId, int stars, CancellationToken cancellationToken = default);
    Task ApplyScoreChangeToWorkAccumulatorsAsync(long workId, int previousStars, int newStars, CancellationToken cancellationToken = default);
}
