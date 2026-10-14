using Application.DTOs;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces;

public interface IWorkRepository
{
    Task<(IReadOnlyList<Work>, int)> GetPagedAsync(
        int currentPage,
        int pageSize,
        string? orderBy,
        string orderDir,
        string? search,
        long? workTypeId,
        bool? isActive,
        long? languageId,
        ContentStatus? contentStatus,
        DateTime? publicationDateFrom,
        DateTime? publicationDateTo,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        CancellationToken cancellationToken = default,
        bool? iaRequest = null,
        IAProcessingStatus? iaStatus = null,
        bool? withDescription = null);

    Task<(IReadOnlyList<Work>, int)> GetCatalogPagedAsync(
        int currentPage,
        int pageSize,
        string? orderBy,
        string orderDir,
        string? search,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        long? workTypeId,
        CancellationToken cancellationToken = default);

    Task<Work?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Work?> GetByIdWithNavigationAsync(long id, CancellationToken cancellationToken = default);
    Task<Work?> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Work>> GetRecommendedAsync(long? userId, string sortBy, CancellationToken cancellationToken = default);
    Task AddAsync(Work work, CancellationToken cancellationToken = default);
    Task UpdateAsync(Work work, CancellationToken cancellationToken = default);
}