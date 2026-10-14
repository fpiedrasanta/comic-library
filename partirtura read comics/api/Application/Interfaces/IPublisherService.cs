using Application.DTOs;

namespace Application.Interfaces;

public interface IPublisherService
{
    Task<ListResponse<AdminPublisherListItemDto>> GetPagedAsync(GetPublishersRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<PublisherFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<CatalogPublisherCardDto>> GetCatalogPagedAsync(GetCatalogPublishersRequest request, CancellationToken cancellationToken = default);
    Task<PublisherDetailDto> GetPublicDetailAsync(long publisherId, CancellationToken cancellationToken = default);
    Task<PublisherDto> CreatePublisherAsync(CreatePublisherRequest request, CancellationToken cancellationToken = default);
    Task<PublisherDto> UpdatePublisherAsync(long publisherId, UpdatePublisherRequest request, CancellationToken cancellationToken = default);
    Task DeactivatePublisherAsync(long publisherId, CancellationToken cancellationToken = default);
    Task ActivatePublisherAsync(long publisherId, CancellationToken cancellationToken = default);
    Task<AdminPublisherDetailDto> GetPublisherDetailAsync(long publisherId, CancellationToken cancellationToken = default);
}
