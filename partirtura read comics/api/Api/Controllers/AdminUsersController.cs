using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Application.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-users")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpGet]
    public async Task<IActionResult> GetAdminUsers([FromQuery] GetAdminUsersRequest request, CancellationToken cancellationToken)
    {
        var result = await _adminUserService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<AdminUserListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpGet("{userId:long}")]
    public async Task<IActionResult> GetAdminUser(long userId, CancellationToken cancellationToken)
    {
        var result = await _adminUserService.GetByIdAsync(userId, cancellationToken);
        return Ok(new ApiResponse<AdminUserDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPost]
    public async Task<IActionResult> CreateAdminUser([FromForm] CreateAdminUserFormRequest request, CancellationToken cancellationToken)
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

        var applicationRequest = new CreateAdminUserRequest
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            CountryId = request.CountryId,
            Password = request.Password,
            AvatarData = avatarData,
            AvatarFileName = avatarFileName
        };

        var userId = await _adminUserService.CreateAdminUserAsync(applicationRequest, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Administrator created successfully.", StatusCodes.Status200OK, new { id = userId }));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPut("{userId:long}")]
    public async Task<IActionResult> UpdateAdminUser(long userId, [FromForm] UpdateAdminUserFormRequest request, CancellationToken cancellationToken)
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

        var applicationRequest = new UpdateAdminUserRequest
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            CountryId = request.CountryId,
            ImageId = request.ImageId,
            AvatarData = avatarData,
            AvatarFileName = avatarFileName
        };

        await _adminUserService.UpdateAdminUserAsync(userId, applicationRequest, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Administrator updated successfully.", StatusCodes.Status200OK, null));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPatch("{userId:long}/deactivate")]
    public async Task<IActionResult> DeactivateAdminUser(long userId, CancellationToken cancellationToken)
    {
        await _adminUserService.DeactivateAdminUserAsync(userId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Administrator deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPatch("{userId:long}/activate")]
    public async Task<IActionResult> ActivateAdminUser(long userId, CancellationToken cancellationToken)
    {
        await _adminUserService.ActivateAdminUserAsync(userId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Administrator activated successfully.", StatusCodes.Status200OK, null));
    }
}
