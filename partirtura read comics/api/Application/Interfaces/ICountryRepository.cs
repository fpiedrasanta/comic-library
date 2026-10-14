using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface ICountryRepository
{
    Task<Country?> GetByIdAsync(long countryId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Country>, int)> GetPagedAsync(int currentPage, int pageSize, string? orderBy, string orderDir, string? search, bool? isActive, CancellationToken cancellationToken = default);
    Task<Country?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<Country?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task AddAsync(Country country, CancellationToken cancellationToken = default);
    Task UpdateAsync(Country country, CancellationToken cancellationToken = default);
}
