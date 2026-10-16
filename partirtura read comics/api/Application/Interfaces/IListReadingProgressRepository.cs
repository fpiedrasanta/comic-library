using Domain.Entities;

namespace Application.Interfaces;

public interface IListReadingProgressRepository
{
    Task<ListReadingProgress?> GetByUserIdAndWorkListIdAsync(long userId, long workListId, CancellationToken cancellationToken = default);
    Task AddAsync(ListReadingProgress progress, CancellationToken cancellationToken = default);
    Task UpdateAsync(ListReadingProgress progress, long currentWorkId, CancellationToken cancellationToken = default);
}
