using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IListTypeService
{
    Task<ListResponse<ListTypeListItemDto>> GetPagedAsync(GetListTypesRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<ListTypeFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default);
    Task<ListTypeListItemDto> CreateAsync(CreateListTypeRequest request, CancellationToken cancellationToken = default);
    Task<ListType> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task UpdateAsync(long id, UpdateListTypeRequest request, CancellationToken cancellationToken = default);
    Task DeactivateAsync(long id, CancellationToken cancellationToken = default);
    Task ActivateAsync(long id, CancellationToken cancellationToken = default);
}
