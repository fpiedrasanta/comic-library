using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-roles")]
[Authorize(Roles = Roles.Administrator)]
public class AdminRolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public AdminRolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetRolesRequest request, CancellationToken cancellationToken)
    {
        var result = await _roleService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<RoleListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request, CancellationToken cancellationToken)
    {
        var result = await _roleService.CreateRoleAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(Get),
            routeValues: new { id = result.Id },
            value: new ApiResponse<RoleListItemDto>(true, "Role created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{roleId:long}")]
    public async Task<IActionResult> Update(long roleId, [FromBody] UpdateRoleRequest request, CancellationToken cancellationToken)
    {
        await _roleService.UpdateRoleAsync(roleId, request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Role updated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{roleId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long roleId, CancellationToken cancellationToken)
    {
        await _roleService.DeactivateRoleAsync(roleId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Role deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{roleId:long}/activate")]
    public async Task<IActionResult> Activate(long roleId, CancellationToken cancellationToken)
    {
        await _roleService.ActivateRoleAsync(roleId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Role activated successfully.", StatusCodes.Status200OK, null));
    }
}
