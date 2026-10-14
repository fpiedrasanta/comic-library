using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-series")]
[Authorize(Roles = Roles.Administrator)]
public class AdminSeriesController : ControllerBase
{
    private readonly ISeriesService _seriesService;

    public AdminSeriesController(ISeriesService seriesService)
    {
        _seriesService = seriesService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetSeriesRequest request, CancellationToken cancellationToken)
    {
        var result = await _seriesService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<SeriesListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{seriesId:long}")]
    public async Task<IActionResult> GetById(long seriesId, CancellationToken cancellationToken)
    {
        var result = await _seriesService.GetByIdAsync(seriesId, cancellationToken);
        return Ok(new ApiResponse<SeriesDetailDto>(true, "Series detail retrieved successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateSeriesFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new CreateSeriesRequest(
            request.Name,
            request.Description,
            request.FranchiseId,
            request.Color,
            request.IsFeatured,
            request.IsOngoing,
            avatarData,
            avatarFileName);

        var result = await _seriesService.CreateSeriesAsync(applicationRequest, cancellationToken);
        return Ok(new ApiResponse<SeriesDetailDto>(true, "Series created successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPut("{seriesId:long}")]
    public async Task<IActionResult> Update(long seriesId, [FromForm] UpdateSeriesFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new UpdateSeriesRequest(
            request.Name,
            request.Description,
            request.FranchiseId,
            request.ImageId,
            request.Color,
            request.IsFeatured,
            request.IsOngoing,
            avatarData,
            avatarFileName);

        var result = await _seriesService.UpdateSeriesAsync(seriesId, applicationRequest, cancellationToken);
        return Ok(new ApiResponse<SeriesDetailDto>(true, "Series updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPatch("{seriesId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long seriesId, CancellationToken cancellationToken)
    {
        await _seriesService.DeactivateSeriesAsync(seriesId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Series deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPatch("{seriesId:long}/activate")]
    public async Task<IActionResult> Activate(long seriesId, CancellationToken cancellationToken)
    {
        await _seriesService.ActivateSeriesAsync(seriesId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Series activated successfully.", StatusCodes.Status200OK, null));
    }
}
