using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkTypeService
{
    Task<ListResponse<WorkTypeListItemDto>> GetPagedAsync(GetWorkTypesRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<WorkTypeFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default);
    Task<WorkTypeListItemDto> CreateWorkTypeAsync(CreateWorkTypeRequest request, CancellationToken cancellationToken = default);
    Task<WorkType> GetWorkTypeByIdAsync(long workTypeId, CancellationToken cancellationToken = default);
    Task<WorkType> UpdateWorkTypeAsync(long workTypeId, UpdateWorkTypeRequest request, CancellationToken cancellationToken = default);
    Task DeactivateWorkTypeAsync(long workTypeId, CancellationToken cancellationToken = default);
    Task ActivateWorkTypeAsync(long workTypeId, CancellationToken cancellationToken = default);
}