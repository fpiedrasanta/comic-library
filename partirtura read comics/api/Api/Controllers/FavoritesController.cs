using Api.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpPost("{workId:long}")]
    public async Task<IActionResult> AddFavorite(long workId, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        await _favoriteService.AddFavoriteAsync(workId, userId.Value, cancellationToken);

        return Ok(new ApiResponse<object>(true, "Favorite added", StatusCodes.Status200OK, null));
    }

    [HttpDelete("{workId:long}")]
    public async Task<IActionResult> RemoveFavorite(long workId, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>(false, "User not authenticated", StatusCodes.Status401Unauthorized, null));
        }

        await _favoriteService.RemoveFavoriteAsync(workId, userId.Value, cancellationToken);

        return Ok(new ApiResponse<object>(true, "Favorite removed", StatusCodes.Status200OK, null));
    }

    private long? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        return long.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
