namespace Application.Interfaces;

using Application.DTOs;

public interface IBanService
{
    Task<ListResponse<BanListItemDto>> GetPagedAsync(GetBansRequest request, CancellationToken cancellationToken = default);
    Task<BanDetailDto> GetByIdAsync(long banId, CancellationToken cancellationToken = default);
    Task<CreateBanResponse> CreateBanAsync(CreateBanRequest request, CancellationToken cancellationToken = default);
    Task UpdateBanAsync(long banId, UpdateBanRequest request, CancellationToken cancellationToken = default);
    Task DeactivateBanAsync(long banId, CancellationToken cancellationToken = default);
}
