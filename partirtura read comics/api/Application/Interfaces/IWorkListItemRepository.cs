using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkListItemRepository
{
    Task<WorkListItem?> GetAsync(long workListId, long workId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WorkListItem>> GetByWorkListAsync(long workListId, CancellationToken cancellationToken = default);

    Task<int> GetMaxPositionAsync(long workListId, CancellationToken cancellationToken = default);

    Task AddAsync(WorkListItem workListItem, CancellationToken cancellationToken = default);

    Task UpdateAsync(WorkListItem workListItem, CancellationToken cancellationToken = default);

    /// <summary>
    /// Physically deletes the relation between a work and a list. The work itself is never deleted.
    /// </summary>
    Task RemoveAsync(WorkListItem workListItem, CancellationToken cancellationToken = default);
}
