using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces;

public interface IWorkReadingProgressRepository
{
    Task<WorkReadingProgress?> GetByWorkIdAndUserIdAsync(long workId, long userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WorkReadingProgress>> GetByWorkIdsAndUserIdAsync(IEnumerable<long> workIds, long userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<WorkReadingProgress> Items, int TotalCount)> GetPagedHistoryByUserIdAsync(long userId, ReadingState? state, int currentPage, int pageSize, CancellationToken cancellationToken = default);
    Task AddAsync(WorkReadingProgress progress, CancellationToken cancellationToken = default);
}