using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IPublisherRepository
{
    Task<Publisher?> GetByIdAsync(long publisherId, CancellationToken cancellationToken = default);
    Task<Publisher?> GetDetailByIdAsync(long publisherId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Publisher>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, bool? isActive, bool? isFeatured, bool? isAlive, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Publisher>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, CancellationToken cancellationToken = default);
    Task<Publisher?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Publisher publisher, CancellationToken cancellationToken = default);
    Task UpdateAsync(Publisher publisher, CancellationToken cancellationToken = default);
}
