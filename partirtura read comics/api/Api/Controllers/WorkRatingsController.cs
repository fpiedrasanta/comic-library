using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/works/{workId:long}/ratings")]
[Authorize]
public class WorkRatingsController : ControllerBase
{
    private readonly IWorkRatingService _workRatingService;

    public WorkRatingsController(IWorkRatingService workRatingService)
    {
        _workRatingService = workRatingService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(long workId, [FromBody] WorkRatingVoteRequest request, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _workRatingService.CreateOrUpdateAsync(workId, userId.Value, request.Stars, request.Review, cancellationToken);

        return CreatedAtAction(
            nameof(Get),
            new { workId },
            new ApiResponse<WorkRatingDto>(true, "Rating saved", StatusCodes.Status201Created, result));
    }

    [HttpPut]
    public async Task<IActionResult> Update(long workId, [FromBody] WorkRatingVoteRequest request, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _workRatingService.CreateOrUpdateAsync(workId, userId.Value, request.Stars, request.Review, cancellationToken);

        return Ok(new ApiResponse<WorkRatingDto>(true, "Rating updated", StatusCodes.Status200OK, result));
    }

    [HttpGet]
    public async Task<IActionResult> Get(long workId, [FromQuery] GetWorkRatingsRequest request, CancellationToken cancellationToken)
    {
        var result = await _workRatingService.GetPagedByWorkIdAsync(workId, request, cancellationToken);

        return Ok(new ApiResponse<ListResponse<WorkRatingListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    private long? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        return long.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
