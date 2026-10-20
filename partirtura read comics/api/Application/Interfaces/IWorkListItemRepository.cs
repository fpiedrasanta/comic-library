using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkListItemRepository
{
    Task<WorkListItem?> GetAsync(long workListId, long workId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkListItem>> GetByWorkListAsync(long workListId, CancellationToken cancellationToken = default);

    Task<int> GetMaxPositionAsync(long workListId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the works of the given set that belong to at least one personal list of the given user.
    /// A single query resolves the whole page, so the callers never issue one query per work.
    /// </summary>
    Task<IReadOnlyList<long>> GetPersonalWorkIdsAsync(long userId, IReadOnlyCollection<long> workIds, CancellationToken cancellationToken = default);

    Task AddAsync(WorkListItem workListItem, CancellationToken cancellationToken = default);

    Task UpdateAsync(WorkListItem workListItem, CancellationToken cancellationToken = default);

    /// <summary>
    /// Physically deletes the relation between a work and a list. The work itself is never deleted.
    /// </summary>
    Task RemoveAsync(WorkListItem workListItem, CancellationToken cancellationToken = default);
}
