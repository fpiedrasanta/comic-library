using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface ICountryService
{
    Task<ListResponse<CountryDto>> GetPagedAsync(ListRequest request, CancellationToken cancellationToken = default);
    Task<ListResponse<CountryDto>> GetPagedAsync(GetCountriesRequest request, CancellationToken cancellationToken = default);
    Task<Country> CreateCountryAsync(CreateCountryRequest request, CancellationToken cancellationToken = default);
    Task<Country> UpdateCountryAsync(long countryId, UpdateCountryRequest request, CancellationToken cancellationToken = default);
    Task DeactivateCountryAsync(long countryId, CancellationToken cancellationToken = default);
    Task ActivateCountryAsync(long countryId, CancellationToken cancellationToken = default);
}
