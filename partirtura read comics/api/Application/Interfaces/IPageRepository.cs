using Domain.Entities;

namespace Application.Interfaces;

public interface IPageRepository
{
    Task<IReadOnlyList<Page>> GetByWorkIdAsync(long workId, CancellationToken cancellationToken = default);
    Task AddAsync(Page page, CancellationToken cancellationToken = default);
    void Remove(Page page);
    Task DeleteByWorkIdAsync(Work work, CancellationToken cancellationToken = default);
}