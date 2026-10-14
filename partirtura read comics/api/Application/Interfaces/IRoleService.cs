using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IRoleService
{
    Task<ListResponse<RoleListItemDto>> GetPagedAsync(GetRolesRequest request, CancellationToken cancellationToken = default);
    Task<RoleListItemDto> CreateRoleAsync(CreateRoleRequest request, CancellationToken cancellationToken = default);
    Task<Role> GetRoleByIdAsync(long roleId, CancellationToken cancellationToken = default);
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Role> EnsureRoleAsync(string name, CancellationToken cancellationToken = default);
    Task<Role> UpdateRoleAsync(long roleId, UpdateRoleRequest request, CancellationToken cancellationToken = default);
    Task DeactivateRoleAsync(long roleId, CancellationToken cancellationToken = default);
    Task ActivateRoleAsync(long roleId, CancellationToken cancellationToken = default);
}
