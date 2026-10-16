using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/reading")]
[Authorize]
public class ReadingController : ControllerBase
{
    private readonly IWorkListService _workListService;

    public ReadingController(IWorkListService workListService)
    {
        _workListService = workListService;
    }

    [HttpPut("lists/{listId:long}/current-work")]
    public async Task<IActionResult> SetCurrentWork(long listId, [FromBody] SetListCurrentWorkRequest request, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        await _workListService.SetCurrentWorkAsync(listId, userId.Value, request.WorkId, cancellationToken);

        return Ok(new ApiResponse<object>(true, "Current work updated", StatusCodes.Status200OK, null));
    }

    private long? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        return long.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
