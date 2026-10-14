using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IFranchiseRepository
{
    Task<Franchise?> GetByIdAsync(long franchiseId, CancellationToken cancellationToken = default);
    Task<Franchise?> GetDetailByIdAsync(long franchiseId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Franchise>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, long? publisherId, bool? isActive, bool? isFeatured, bool? isOngoing, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Franchise>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, CancellationToken cancellationToken = default);
    Task AddAsync(Franchise franchise, CancellationToken cancellationToken = default);
    Task UpdateAsync(Franchise franchise, CancellationToken cancellationToken = default);
}
