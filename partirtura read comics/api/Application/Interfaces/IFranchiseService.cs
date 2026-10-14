using Application.DTOs;

namespace Application.Interfaces;

public interface IFranchiseService
{
    Task<ListResponse<FranchiseListItemDto>> GetPagedAsync(GetFranchisesRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<FranchiseFilterDto>> GetPublicPagedAsync(GetPublicFranchisesRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<CatalogFranchiseCardDto>> GetCatalogPagedAsync(GetCatalogFranchisesRequest request, CancellationToken cancellationToken = default);
    Task<PublicFranchiseDetailDto> GetPublicDetailAsync(long franchiseId, CancellationToken cancellationToken = default);
    Task<FranchiseDetailDto> GetByIdAsync(long franchiseId, CancellationToken cancellationToken = default);
    Task<FranchiseDetailDto> CreateFranchiseAsync(CreateFranchiseRequest request, CancellationToken cancellationToken = default);
    Task<FranchiseDetailDto> UpdateFranchiseAsync(long franchiseId, UpdateFranchiseRequest request, CancellationToken cancellationToken = default);
    Task DeactivateFranchiseAsync(long franchiseId, CancellationToken cancellationToken = default);
    Task ActivateFranchiseAsync(long franchiseId, CancellationToken cancellationToken = default);
}
