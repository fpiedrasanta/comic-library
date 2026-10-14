using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/works/recommended")]
[Authorize]
public class RecommendedWorksController : ControllerBase
{
    private readonly IRecommendedWorksService _recommendedWorksService;

    public RecommendedWorksController(IRecommendedWorksService recommendedWorksService)
    {
        _recommendedWorksService = recommendedWorksService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? sortBy, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (!long.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        var result = await _recommendedWorksService.GetRecommendedAsync(userId, sortBy, cancellationToken);

        return Ok(new ApiResponse<IReadOnlyList<WorkCatalogItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }
}
