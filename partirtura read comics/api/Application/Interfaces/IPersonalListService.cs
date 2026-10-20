using Application.DTOs;

namespace Application.Interfaces;

public interface IPersonalListService
{
    Task<PersonalListSummaryDto> CreateAsync(CreatePersonalListRequest request, long userId, CancellationToken cancellationToken = default);

    Task<PersonalListSummaryDto> GetSummaryAsync(long listId, long userId, CancellationToken cancellationToken = default);

    Task<PersonalListSummaryDto> RenameAsync(long listId, UpdatePersonalListRequest request, long userId, CancellationToken cancellationToken = default);

    Task DeleteAsync(long listId, long userId, CancellationToken cancellationToken = default);

    Task<PersonalListSummaryDto> AddWorkAsync(long listId, AddWorkToPersonalListRequest request, long userId, CancellationToken cancellationToken = default);

    Task RemoveWorkAsync(long listId, long workId, long userId, CancellationToken cancellationToken = default);

    Task ReorderWorksAsync(long listId, ReorderPersonalListWorksRequest request, long userId, CancellationToken cancellationToken = default);
}
