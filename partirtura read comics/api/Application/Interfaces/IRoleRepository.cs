using Application.Constants;
using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IRoleRepository
{
    Task<(IReadOnlyList<Role>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy = null, string orderDir = SortDirection.ASC, CancellationToken cancellationToken = default);
    Task<Role?> GetByIdAsync(long roleId, CancellationToken cancellationToken = default);
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Role role, CancellationToken cancellationToken = default);
    Task UpdateAsync(Role role, CancellationToken cancellationToken = default);
}
