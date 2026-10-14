using Application.Constants;
using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IListTypeRepository
{
    Task<(IReadOnlyList<ListType>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy = null, string orderDir = SortDirection.ASC, CancellationToken cancellationToken = default);
    Task<ListType?> GetByIdAsync(long listTypeId, CancellationToken cancellationToken = default);
    Task<ListType?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(ListType listType, CancellationToken cancellationToken = default);
    Task UpdateAsync(ListType listType, CancellationToken cancellationToken = default);
}
