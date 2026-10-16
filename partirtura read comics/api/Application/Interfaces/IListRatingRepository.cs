using Domain.Entities;

namespace Application.Interfaces;

public interface IListRatingRepository
{
    Task<ListRating?> GetByUserIdAndWorkListIdAsync(long userId, long workListId, CancellationToken cancellationToken = default);
    Task AddAsync(ListRating rating, CancellationToken cancellationToken = default);
    Task UpdateAsync(ListRating rating, CancellationToken cancellationToken = default);
    Task ApplyNewVoteToWorkListAccumulatorsAsync(long workListId, int stars, CancellationToken cancellationToken = default);
    Task ApplyScoreChangeToWorkListAccumulatorsAsync(long workListId, int previousStars, int newStars, CancellationToken cancellationToken = default);
    Task ApplyReactivationToWorkListAccumulatorsAsync(long workListId, int stars, CancellationToken cancellationToken = default);
    void Detach(ListRating rating);
}
