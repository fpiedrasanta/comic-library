using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-franchises")]
[Authorize(Roles = Roles.Administrator)]
public class AdminFranchisesController : ControllerBase
{
    private readonly IFranchiseService _franchiseService;

    public AdminFranchisesController(IFranchiseService franchiseService)
    {
        _franchiseService = franchiseService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetFranchisesRequest request, CancellationToken cancellationToken)
    {
        var result = await _franchiseService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<FranchiseListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{franchiseId:long}")]
    public async Task<IActionResult> GetById(long franchiseId, CancellationToken cancellationToken)
    {
        var result = await _franchiseService.GetByIdAsync(franchiseId, cancellationToken);
        return Ok(new ApiResponse<FranchiseDetailDto>(true, "Franchise detail retrieved successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateFranchiseFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new CreateFranchiseRequest(
            request.Name,
            request.Description,
            request.PublisherId,
            request.Color,
            request.IsFeatured,
            request.IsOngoing,
            avatarData,
            avatarFileName);

        var result = await _franchiseService.CreateFranchiseAsync(applicationRequest, cancellationToken);
        return Ok(new ApiResponse<FranchiseDetailDto>(true, "Franchise created successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPut("{franchiseId:long}")]
    public async Task<IActionResult> Update(long franchiseId, [FromForm] UpdateFranchiseFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new UpdateFranchiseRequest(
            request.Name,
            request.Description,
            request.PublisherId,
            request.ImageId,
            request.Color,
            request.IsFeatured,
            request.IsOngoing,
            avatarData,
            avatarFileName);

        var result = await _franchiseService.UpdateFranchiseAsync(franchiseId, applicationRequest, cancellationToken);
        return Ok(new ApiResponse<FranchiseDetailDto>(true, "Franchise updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPatch("{franchiseId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long franchiseId, CancellationToken cancellationToken)
    {
        await _franchiseService.DeactivateFranchiseAsync(franchiseId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Franchise deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPatch("{franchiseId:long}/activate")]
    public async Task<IActionResult> Activate(long franchiseId, CancellationToken cancellationToken)
    {
        await _franchiseService.ActivateFranchiseAsync(franchiseId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Franchise activated successfully.", StatusCodes.Status200OK, null));
    }
}
