using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/reading")]
[Authorize]
public class ListReaderController : ControllerBase
{
    private readonly IListReaderService _listReaderService;

    public ListReaderController(IListReaderService listReaderService)
    {
        _listReaderService = listReaderService;
    }

    [HttpGet("lists/{listId:long}/work/{workId:long}")]
    public async Task<IActionResult> GetReaderContext(long listId, long workId, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        var result = await _listReaderService.GetReaderContextAsync(listId, workId, userId, cancellationToken);

        return Ok(new ApiResponse<ListReaderContextDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    private long? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        return long.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
