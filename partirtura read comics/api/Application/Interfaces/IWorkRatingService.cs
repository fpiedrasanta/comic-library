using Application.DTOs;

namespace Application.Interfaces;

public interface IWorkRatingService
{
    Task<WorkRatingDto> CreateOrUpdateAsync(long workId, long userId, int? stars, string? review, CancellationToken cancellationToken = default);
    Task<ListResponse<WorkRatingListItemDto>> GetPagedByWorkIdAsync(long workId, GetWorkRatingsRequest request, CancellationToken cancellationToken = default);
}
