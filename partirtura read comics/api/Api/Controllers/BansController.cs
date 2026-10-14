using Application.DTOs;
using Application.Interfaces;
using Application.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Api.DTOs;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Administrator)]
public class BansController : ControllerBase
{
    private readonly IBanService _banService;

    public BansController(IBanService banService)
    {
        _banService = banService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetBansRequest request, CancellationToken cancellationToken)
    {
        var result = await _banService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<BanListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{banId:long}")]
    public async Task<IActionResult> GetById(long banId, CancellationToken cancellationToken)
    {
        var result = await _banService.GetByIdAsync(banId, cancellationToken);
        return Ok(new ApiResponse<BanDetailDto>(true, "Ban detail retrieved successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBanRequest request, CancellationToken cancellationToken)
    {
        var result = await _banService.CreateBanAsync(request, cancellationToken);
        return Ok(new ApiResponse<CreateBanResponse>(true, "Ban created successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPut("{banId}")]
    public async Task<IActionResult> Update(long banId, [FromBody] UpdateBanRequest request, CancellationToken cancellationToken)
    {
        await _banService.UpdateBanAsync(banId, request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Ban updated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPatch("{banId}/deactivate")]
    public async Task<IActionResult> Deactivate(long banId, CancellationToken cancellationToken)
    {
        await _banService.DeactivateBanAsync(banId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Ban deactivated successfully.", StatusCodes.Status200OK, null));
    }
}
