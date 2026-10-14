using Application.DTOs;

namespace Application.Interfaces;

public interface ISeriesService
{
    Task<ListResponse<SeriesListItemDto>> GetPagedAsync(GetSeriesRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<SeriesFilterDto>> GetPublicPagedAsync(GetPublicSeriesRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<CatalogSeriesCardDto>> GetCatalogPagedAsync(GetCatalogSeriesRequest request, CancellationToken cancellationToken = default);
    Task<PublicSeriesDetailDto> GetPublicDetailAsync(long seriesId, CancellationToken cancellationToken = default);
    Task<SeriesDetailDto> GetByIdAsync(long seriesId, CancellationToken cancellationToken = default);
    Task<SeriesDetailDto> CreateSeriesAsync(CreateSeriesRequest request, CancellationToken cancellationToken = default);
    Task<SeriesDetailDto> UpdateSeriesAsync(long seriesId, UpdateSeriesRequest request, CancellationToken cancellationToken = default);
    Task DeactivateSeriesAsync(long seriesId, CancellationToken cancellationToken = default);
    Task ActivateSeriesAsync(long seriesId, CancellationToken cancellationToken = default);
}
