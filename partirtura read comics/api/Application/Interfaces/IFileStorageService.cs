using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces;

public interface IFileStorageService
{
    Task<Image> SaveAsync(byte[] data, string fileName, ImageType type, CancellationToken cancellationToken = default);
    Task<string> SaveFileAsync(byte[] data, string fileName, string folder, CancellationToken cancellationToken = default);
    Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default);
    string GetPhysicalPath(string storagePath);
}
