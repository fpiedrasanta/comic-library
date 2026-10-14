using Application.DTOs;

namespace Application.Interfaces;

public interface IReadingHistoryService
{
    Task<ListResponse<WorkCatalogItemDto>> GetPagedAsync(GetReadingHistoryRequest request, long userId, CancellationToken cancellationToken = default);
}
