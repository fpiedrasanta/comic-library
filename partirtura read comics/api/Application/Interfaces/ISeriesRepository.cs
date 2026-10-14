using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface ISeriesRepository
{
    Task<Series?> GetByIdAsync(long seriesId, CancellationToken cancellationToken = default);
    Task<Series?> GetDetailByIdAsync(long seriesId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Series>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, long? publisherId, long? franchiseId, bool? isActive, bool? isFeatured, bool? isOngoing, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Series>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(long seriesId, CancellationToken cancellationToken = default);
    Task AddAsync(Series series, CancellationToken cancellationToken = default);
    Task UpdateAsync(Series series, CancellationToken cancellationToken = default);
}
