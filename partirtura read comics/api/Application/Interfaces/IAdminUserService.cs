namespace Application.Interfaces;

using Application.DTOs;

public interface IAdminUserService
{
    Task<ListResponse<AdminUserListItemDto>> GetPagedAsync(GetAdminUsersRequest request, CancellationToken cancellationToken = default);
    Task<AdminUserDetailDto> GetByIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<long> CreateAdminUserAsync(CreateAdminUserRequest request, CancellationToken cancellationToken = default);
    Task UpdateAdminUserAsync(long userId, UpdateAdminUserRequest request, CancellationToken cancellationToken = default);
    Task DeactivateAdminUserAsync(long userId, CancellationToken cancellationToken = default);
    Task ActivateAdminUserAsync(long userId, CancellationToken cancellationToken = default);
}
