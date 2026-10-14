using Application.DTOs;

namespace Application.Interfaces;

public interface IUserQueryService
{
    Task<ListResponse<UserListItemDto>> GetPagedAsync(GetUsersRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<UserListItemDto>> GetActiveForBanSelectionAsync(GetUsersForBanSelectionRequest request, CancellationToken cancellationToken = default);
    Task<UserDetailDto> GetDetailAsync(long userId, CancellationToken cancellationToken = default);
}
