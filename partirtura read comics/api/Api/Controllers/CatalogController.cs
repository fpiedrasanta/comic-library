using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Api.Controllers;

[ApiController]
[Route("api/catalog")]
[Authorize]
public class CatalogController : ControllerBase
{
    private readonly IPublisherService _publisherService;
    private readonly IFranchiseService _franchiseService;
    private readonly ISeriesService _seriesService;
    private readonly IWorkListService _workListService;

    public CatalogController(
        IPublisherService publisherService,
        IFranchiseService franchiseService,
        ISeriesService seriesService,
        IWorkListService workListService)
    {
        _publisherService = publisherService;
        _franchiseService = franchiseService;
        _seriesService = seriesService;
        _workListService = workListService;
    }

    [HttpGet("publishers")]
    public async Task<IActionResult> GetPublishers([FromQuery] GetCatalogPublishersRequest request, CancellationToken cancellationToken)
    {
        var result = await _publisherService.GetCatalogPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<CatalogPublisherCardDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("franchises")]
    public async Task<IActionResult> GetFranchises([FromQuery] GetCatalogFranchisesRequest request, CancellationToken cancellationToken)
    {
        var result = await _franchiseService.GetCatalogPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<CatalogFranchiseCardDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("series")]
    public async Task<IActionResult> GetSeries([FromQuery] GetCatalogSeriesRequest request, CancellationToken cancellationToken)
    {
        var result = await _seriesService.GetCatalogPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<CatalogSeriesCardDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("lists")]
    public async Task<IActionResult> GetLists([FromQuery] GetCatalogListsRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _workListService.GetCatalogPagedAsync(request, userId, cancellationToken);
        return Ok(new ApiResponse<ListResponse<CatalogListCardDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("lists/{id:long}")]
    public async Task<IActionResult> GetList(long id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _workListService.GetCatalogByIdAsync(id, userId, cancellationToken);
        return Ok(new ApiResponse<CatalogListDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    private long? GetUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return long.TryParse(userIdClaim, out var parsedId) ? parsedId : null;
    }
}
