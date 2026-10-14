using System.Net;
using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/countries")]
public class CountriesController : ControllerBase
{
    private readonly ICountryService _countryService;

    public CountriesController(ICountryService countryService)
    {
        _countryService = countryService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ListRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _countryService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<CountryDto>>(true, "OK", StatusCodes.Status200OK, result));
    }
}
