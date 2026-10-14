using Domain.Entities;

namespace Application.Interfaces;

public interface IImageRepository
{
    Task<Image?> GetByIdAsync(long imageId, CancellationToken cancellationToken = default);
    Task AddAsync(Image image, CancellationToken cancellationToken = default);
    void Remove(Image image);
}
