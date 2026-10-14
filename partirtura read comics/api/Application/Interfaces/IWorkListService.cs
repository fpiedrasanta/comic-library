using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkListService
{
    Task<ListResponse<WorkListListItemDto>> GetPagedAsync(GetWorkListsRequest request, CancellationToken cancellationToken = default);
    Task<WorkListDetailDto> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<WorkListDetailDto> CreateAsync(CreateWorkListRequest request, CancellationToken cancellationToken = default);
    Task<WorkListDetailDto> UpdateAsync(long id, UpdateWorkListRequest request, CancellationToken cancellationToken = default);
    Task DeactivateAsync(long id, CancellationToken cancellationToken = default);
    Task ActivateAsync(long id, CancellationToken cancellationToken = default);
    Task<ListResponse<CatalogListCardDto>> GetCatalogPagedAsync(GetCatalogListsRequest request, CancellationToken cancellationToken = default);
    Task<CatalogListDetailDto> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default);
}