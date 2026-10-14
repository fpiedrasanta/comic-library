using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAndValidationTokenHashAsync(string email, string tokenHash, CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(long userId, CancellationToken cancellationToken = default);
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<User> Items, int TotalCount)> GetPagedAsync(GetUsersRequest request, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<User> Items, int TotalCount)> GetActiveForBanSelectionAsync(GetUsersForBanSelectionRequest request, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<User> Items, int TotalCount)> GetAdminUsersPagedAsync(GetAdminUsersRequest request, CancellationToken cancellationToken = default);
    Task<int> GetActiveAdminUsersCountAsync(CancellationToken cancellationToken = default);
}
