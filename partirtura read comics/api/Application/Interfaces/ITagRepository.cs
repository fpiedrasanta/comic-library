using Application.Constants;
using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface ITagRepository
{
    Task<(IReadOnlyList<Tag>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, string? orderBy = null, string orderDir = SortDirection.ASC, CancellationToken cancellationToken = default);
    Task<Tag?> GetByIdAsync(long tagId, CancellationToken cancellationToken = default);
    Task<Tag?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Tag tag, CancellationToken cancellationToken = default);
    Task UpdateAsync(Tag tag, CancellationToken cancellationToken = default);
}
