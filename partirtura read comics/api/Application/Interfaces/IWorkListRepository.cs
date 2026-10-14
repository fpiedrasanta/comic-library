using Application.Constants;
using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkListRepository
{
    Task<(IReadOnlyList<WorkList>, int)> GetPagedAsync(
        int currentPage,
        int pageSize,
        string? search,
        bool? isActive,
        long? franchiseId,
        long? publisherId,
        long? listTypeId,
        DateTime? createdAtFrom,
        DateTime? createdAtTo,
        string? orderBy,
        string orderDir,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<WorkListCardData> Items, int TotalCount)> GetCatalogPagedAsync(long? userId,
        int currentPage,
        int pageSize,
        string? search,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        long? listTypeId,
        string? orderBy,
        string? orderDir,
        CancellationToken cancellationToken = default);

    Task<WorkList?> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<WorkList?> GetByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<WorkList?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    Task AddAsync(WorkList workList, CancellationToken cancellationToken = default);

    Task UpdateAsync(WorkList workList, CancellationToken cancellationToken = default);
}
