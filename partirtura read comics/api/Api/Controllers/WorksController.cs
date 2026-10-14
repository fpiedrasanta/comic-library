using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/works")]
[Authorize]
public class WorksController : ControllerBase
{
    private readonly IWorkService _workService;

    public WorksController(IWorkService workService)
    {
        _workService = workService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetCatalogWorksRequest request, CancellationToken cancellationToken)
    {
        long? userId = null;
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (long.TryParse(userIdClaim, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _workService.GetCatalogPagedAsync(request, userId, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkCatalogItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        long? userId = null;
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (long.TryParse(userIdClaim, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _workService.GetCatalogByIdAsync(id, userId, cancellationToken);
        return Ok(new ApiResponse<CatalogWorkDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{id:long}/pages")]
    public async Task<IActionResult> GetPages(long id, CancellationToken cancellationToken)
    {
        long? userId = null;
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (long.TryParse(userIdClaim, out var parsedId))
        {
            userId = parsedId;
        }
        
        var result = await _workService.GetReaderPagesAsync(id, userId, cancellationToken);
        return Ok(new ApiResponse<ReaderWorkPagesDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPut("{id:long}/progress")]
    public async Task<IActionResult> UpdateProgress(long id, [FromBody] UpdateReadingProgressRequest request, CancellationToken cancellationToken)
    {
        long? userId = null;
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (!long.TryParse(userIdClaim, out var parsedId))
        {
            return Unauthorized(new ApiResponse<object>(false, "Usuario no autenticado", StatusCodes.Status401Unauthorized, null));
        }
        userId = parsedId;

        await _workService.UpdateReadingProgressAsync(id, userId.Value, request.CurrentPage, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Progreso actualizado", StatusCodes.Status200OK, null));
    }
}
