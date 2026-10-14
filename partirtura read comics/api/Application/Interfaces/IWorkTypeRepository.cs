using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkTypeRepository
{
    Task<(IReadOnlyList<WorkType> Items, int TotalCount)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy, string orderDir, CancellationToken cancellationToken = default);
    Task<WorkType?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<WorkType?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(WorkType workType, CancellationToken cancellationToken = default);
    Task UpdateAsync(WorkType workType, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> IsActiveAsync(long id, CancellationToken cancellationToken = default);
}