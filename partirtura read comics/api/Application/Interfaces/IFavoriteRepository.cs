using Domain.Entities;

namespace Application.Interfaces;

public interface IFavoriteRepository
{
    Task<bool> ExistsAsync(long userId, long workId, CancellationToken cancellationToken);
    Task<IReadOnlyList<long>> GetFavoriteWorkIdsAsync(long userId, IReadOnlyCollection<long> workIds, CancellationToken cancellationToken);
    Task<Favorite?> GetAsync(long userId, long workId, CancellationToken cancellationToken);
    Task AddAsync(Favorite favorite, CancellationToken cancellationToken);
    Task RemoveAsync(Favorite favorite, CancellationToken cancellationToken);
}
