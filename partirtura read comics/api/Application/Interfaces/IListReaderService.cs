using Application.DTOs;

namespace Application.Interfaces;

public interface IListReaderService
{
    Task<ListReaderContextDto> GetReaderContextAsync(long workListId, long workId, long? userId, CancellationToken cancellationToken = default);
}
