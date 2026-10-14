using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IBanRepository
{
    Task AddAsync(Ban ban, CancellationToken cancellationToken = default);
    Task<Ban?> GetByIdAsync(long banId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Ban>> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Ban> Items, int TotalCount)> GetPagedAsync(GetBansRequest request, CancellationToken cancellationToken = default);
}
