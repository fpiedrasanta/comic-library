using Application.DTOs;

namespace Application.Interfaces;

public interface IWorkService
{
    Task<ListResponse<WorkListItemDto>> GetPagedAsync(GetWorksRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<WorkCatalogItemDto>> GetCatalogPagedAsync(GetCatalogWorksRequest request, long? userId, CancellationToken cancellationToken = default);
    Task<CatalogWorkDetailDto> GetCatalogByIdAsync(long id, long? userId, CancellationToken cancellationToken = default);
    Task<WorkDetailDto?> GetByIdAsync(long workId, CancellationToken cancellationToken = default);
    Task<WorkDetailDto> CreateAsync(CreateWorkRequest request, CancellationToken cancellationToken = default);
    Task<WorkDetailDto> CreateWithContentAsync(CreateWorkWithContentRequest request, CancellationToken cancellationToken = default);
    Task<WorkDetailDto> UpdateAsync(long workId, UpdateWorkRequest request, CancellationToken cancellationToken = default);
    Task DeactivateAsync(long workId, CancellationToken cancellationToken = default);
    Task ActivateAsync(long workId, CancellationToken cancellationToken = default);
    Task EnqueueWorkAnalysisAsync(long workId, IReadOnlyList<long> imageIds, CancellationToken cancellationToken = default);
    Task<ReaderWorkPagesDto> GetReaderPagesAsync(long workId, long? userId, CancellationToken cancellationToken = default);
    Task UpdateReadingProgressAsync(long workId, long userId, int currentPage, CancellationToken cancellationToken = default);
    Task<int?> GetCurrentPageAsync(long workId, long userId, CancellationToken cancellationToken = default);
}