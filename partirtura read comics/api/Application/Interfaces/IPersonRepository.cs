using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IPersonRepository
{
    Task<(IReadOnlyList<Person>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, CancellationToken cancellationToken = default);
    Task<Person?> GetByIdAsync(long personId, CancellationToken cancellationToken = default);
    Task<Person?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Person person, CancellationToken cancellationToken = default);
    Task UpdateAsync(Person person, CancellationToken cancellationToken = default);
}
