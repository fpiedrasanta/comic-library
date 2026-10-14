using Application.DTOs;

namespace Application.Interfaces;

public interface IWorkContentService
{
    Task UploadCbrAsync(long workId, byte[] fileData, string fileName, CancellationToken cancellationToken = default);
    Task<WorkImagesResponse> GetImagesAsync(long workId, CancellationToken cancellationToken = default);
    Task SetCoverAsync(long workId, long imageId, CancellationToken cancellationToken = default);
    Task<ContentStatusDto> GetContentStatusAsync(long workId, CancellationToken cancellationToken = default);
    Task RetryContentAsync(long workId, byte[] fileData, string fileName, CancellationToken cancellationToken = default);
    Task DeleteContentAsync(long workId, CancellationToken cancellationToken = default);
}