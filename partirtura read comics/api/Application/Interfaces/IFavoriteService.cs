using Domain.Entities;

namespace Application.Interfaces;

public interface IFavoriteService
{
    Task AddFavoriteAsync(long workId, long userId, CancellationToken cancellationToken);
    Task RemoveFavoriteAsync(long workId, long userId, CancellationToken cancellationToken);
}
