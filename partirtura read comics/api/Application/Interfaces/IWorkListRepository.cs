using Application.Constants;
using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IWorkListRepository
{
    Task<(IReadOnlyList<WorkList>, int)> GetPagedAsync(
        int currentPage,
        int pageSize,
        string? search,
        bool? isActive,
        long? franchiseId,
        long? publisherId,
        long? listTypeId,
        DateTime? createdAtFrom,
        DateTime? createdAtTo,
        string? orderBy,
        string orderDir,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<WorkListCardData> Items, int TotalCount)> GetCatalogPagedAsync(long? userId,
        int currentPage,
        int pageSize,
        string? search,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        long? listTypeId,
        string? orderBy,
        string? orderDir,
        CancellationToken cancellationToken = default,
        bool myLists = false);

    Task<WorkList?> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default, long? userId = null);

    /// <summary>
    /// Returns a list that the given user owns (personal list), or null when the list does not
    /// exist, is not personal or belongs to another user.
    /// </summary>
    Task<WorkList?> GetPersonalByIdAsync(long id, long userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a personal list owned by the given user with its work items loaded, ordered by position.
    /// </summary>
    Task<WorkList?> GetPersonalWithItemsAsync(long id, long userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the personal lists of the given user with the membership of an optional work, the optional
    /// name filter and the result limit already applied in the database. The lists that contain the work
    /// come first and, inside each group, the lists are ordered by name.
    /// </summary>
    Task<IReadOnlyList<PersonalListMembershipData>> GetPersonalWithMembershipAsync(
        long userId,
        string? search,
        int pageSize,
        long? workId,
        CancellationToken cancellationToken = default);

    Task<WorkList?> GetByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<WorkList?> GetByNameAsync(string name, CancellationToken cancellationToken = default);

    Task AddAsync(WorkList workList, CancellationToken cancellationToken = default);

    Task UpdateAsync(WorkList workList, CancellationToken cancellationToken = default);

    /// <summary>
    /// Physically deletes a list and its work items. Used by the personal list deletion use case.
    /// </summary>
    Task DeleteAsync(WorkList workList, CancellationToken cancellationToken = default);
}
