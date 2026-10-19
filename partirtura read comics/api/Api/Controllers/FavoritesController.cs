using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

    private long GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(id) || !long.TryParse(id, out var userId))
        {
            throw new UnauthorizedAccessException("Usuario no autenticado");
        }
        return userId;
    }

    [HttpPost("{workId}")]
    public async Task<IActionResult> AddFavorite(long workId, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        await _favoriteService.AddFavoriteAsync(workId, userId, cancellationToken);
        return Ok(new { success = true, message = "Favorito agregado" });
    }

    [HttpDelete("{workId}")]
    public async Task<IActionResult> RemoveFavorite(long workId, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        await _favoriteService.RemoveFavoriteAsync(workId, userId, cancellationToken);
        return Ok(new { success = true, message = "Favorito eliminado" });
    }
}
