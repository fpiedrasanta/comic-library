using Application.DTOs;

namespace Application.Interfaces;

public interface IListRatingService
{
    Task<ListRatingDto> CreateOrUpdateAsync(long workListId, long userId, int stars, string? review, CancellationToken cancellationToken = default);
}
