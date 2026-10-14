using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Application.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-countries")]
public class AdminCountriesController : ControllerBase
{
    private readonly ICountryService _countryService;

    public AdminCountriesController(ICountryService countryService)
    {
        _countryService = countryService;
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpGet]
    public async Task<IActionResult> GetAdminCountries([FromQuery] GetCountriesRequest request, CancellationToken cancellationToken)
    {
        var result = await _countryService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<CountryDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPost]
    public async Task<IActionResult> CreateCountry([FromBody] CreateCountryRequest request, CancellationToken cancellationToken)
    {
        var country = await _countryService.CreateCountryAsync(request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Country created successfully.", StatusCodes.Status200OK, new { id = country.Id }));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPut("{countryId:long}")]
    public async Task<IActionResult> UpdateCountry(long countryId, [FromBody] UpdateCountryRequest request, CancellationToken cancellationToken)
    {
        await _countryService.UpdateCountryAsync(countryId, request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Country updated successfully.", StatusCodes.Status200OK, null));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPatch("{countryId:long}/deactivate")]
    public async Task<IActionResult> DeactivateCountry(long countryId, CancellationToken cancellationToken)
    {
        await _countryService.DeactivateCountryAsync(countryId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Country deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPatch("{countryId:long}/activate")]
    public async Task<IActionResult> ActivateCountry(long countryId, CancellationToken cancellationToken)
    {
        await _countryService.ActivateCountryAsync(countryId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Country activated successfully.", StatusCodes.Status200OK, null));
    }
}
