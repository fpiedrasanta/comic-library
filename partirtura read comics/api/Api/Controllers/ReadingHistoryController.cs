using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/users/me/reading-history")]
[Authorize]
public class ReadingHistoryController : ControllerBase
{
    private readonly IReadingHistoryService _readingHistoryService;

    public ReadingHistoryController(IReadingHistoryService readingHistoryService)
    {
        _readingHistoryService = readingHistoryService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetReadingHistoryRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (!long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _readingHistoryService.GetPagedAsync(request, userId, cancellationToken);

        return Ok(new ApiResponse<ListResponse<WorkCatalogItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }
}
