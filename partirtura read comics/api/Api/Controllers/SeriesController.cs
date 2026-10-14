using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/series")]
[Authorize]
public class SeriesController : ControllerBase
{
    private readonly ISeriesService _seriesService;

    public SeriesController(ISeriesService seriesService)
    {
        _seriesService = seriesService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetPublicSeriesRequest request, CancellationToken cancellationToken)
    {
        var result = await _seriesService.GetPublicPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<SeriesFilterDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        var result = await _seriesService.GetPublicDetailAsync(id, cancellationToken);
        return Ok(new ApiResponse<PublicSeriesDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }
}