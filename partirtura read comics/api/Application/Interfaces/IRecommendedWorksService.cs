using Application.DTOs;

namespace Application.Interfaces;

public interface IRecommendedWorksService
{
    Task<IReadOnlyList<WorkCatalogItemDto>> GetRecommendedAsync(long? userId, string? sortBy, CancellationToken cancellationToken = default);
}
