using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

public static class CountryMapper
{
    public static CountryDto ToDto(this Country country)
    {
        return new CountryDto(country.Id, country.Code, country.Name, country.IsActive);
    }

    public static IReadOnlyList<CountryDto> ToDtoList(this IEnumerable<Country> countries)
    {
        return countries.Select(c => c.ToDto()).ToList();
    }
}
