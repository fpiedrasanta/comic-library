using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/catalog/lists/{listId:long}/ratings")]
[Authorize]
public class ListRatingsController : ControllerBase
{
    private readonly IListRatingService _listRatingService;

    public ListRatingsController(IListRatingService listRatingService)
    {
        _listRatingService = listRatingService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(long listId, [FromBody] ListRatingVoteRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ApiResponse<object>(false, "Invalid request", StatusCodes.Status400BadRequest, null));
        }

        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _listRatingService.CreateOrUpdateAsync(listId, userId.Value, request.Stars, request.Review, cancellationToken);

        return CreatedAtAction(
            nameof(Get),
            new { listId },
            new ApiResponse<ListRatingDto>(true, "Rating saved", StatusCodes.Status201Created, result));
    }

    [HttpPut]
    public async Task<IActionResult> Update(long listId, [FromBody] ListRatingVoteRequest request, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _listRatingService.CreateOrUpdateAsync(listId, userId.Value, request.Stars, request.Review, cancellationToken);

        return Ok(new ApiResponse<ListRatingDto>(true, "Rating updated", StatusCodes.Status200OK, result));
    }

    [HttpGet]
    public IActionResult Get(long listId)
    {
        return Ok(new ApiResponse<object>(true, "OK", StatusCodes.Status200OK, null));
    }

    private long? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        return long.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
