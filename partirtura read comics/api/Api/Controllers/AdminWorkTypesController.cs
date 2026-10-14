using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-work-types")]
[Authorize(Roles = Roles.Administrator)]
public class AdminWorkTypesController : ControllerBase
{
    private readonly IWorkTypeService _workTypeService;

    public AdminWorkTypesController(IWorkTypeService workTypeService)
    {
        _workTypeService = workTypeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetWorkTypesRequest request, CancellationToken cancellationToken)
    {
        var result = await _workTypeService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkTypeListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkTypeRequest request, CancellationToken cancellationToken)
    {
        var result = await _workTypeService.CreateWorkTypeAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(Get),
            routeValues: new { id = result.Id },
            value: new ApiResponse<WorkTypeListItemDto>(true, "Work type created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{workTypeId:long}")]
    public async Task<IActionResult> Update(long workTypeId, [FromBody] UpdateWorkTypeRequest request, CancellationToken cancellationToken)
    {
        await _workTypeService.UpdateWorkTypeAsync(workTypeId, request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work type updated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{workTypeId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long workTypeId, CancellationToken cancellationToken)
    {
        await _workTypeService.DeactivateWorkTypeAsync(workTypeId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work type deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{workTypeId:long}/activate")]
    public async Task<IActionResult> Activate(long workTypeId, CancellationToken cancellationToken)
    {
        await _workTypeService.ActivateWorkTypeAsync(workTypeId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work type activated successfully.", StatusCodes.Status200OK, null));
    }
}