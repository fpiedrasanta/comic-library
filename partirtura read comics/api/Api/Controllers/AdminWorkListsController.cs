using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-work-lists")]
[Authorize(Roles = Roles.Administrator)]
public class AdminWorkListsController : ControllerBase
{
    private readonly IWorkListService _workListService;

    public AdminWorkListsController(IWorkListService workListService)
    {
        _workListService = workListService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetWorkListsRequest request, CancellationToken cancellationToken)
    {
        var result = await _workListService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkListListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{workListId:long}")]
    public async Task<IActionResult> GetById(long workListId, CancellationToken cancellationToken)
    {
        var result = await _workListService.GetByIdAsync(workListId, cancellationToken);
        return Ok(new ApiResponse<WorkListDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.AdminWorkListCreate)]
    public async Task<IActionResult> Create([FromBody] CreateWorkListRequest request, CancellationToken cancellationToken)
    {
        var result = await _workListService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(GetById),
            routeValues: new { workListId = result.Id },
            value: new ApiResponse<WorkListDetailDto>(true, "WorkList created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{workListId:long}")]
    public async Task<IActionResult> Update(long workListId, [FromBody] UpdateWorkListRequest request, CancellationToken cancellationToken)
    {
        var result = await _workListService.UpdateAsync(workListId, request, cancellationToken);
        return Ok(new ApiResponse<WorkListDetailDto>(true, "WorkList updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpDelete("{workListId:long}")]
    public async Task<IActionResult> Deactivate(long workListId, CancellationToken cancellationToken)
    {
        await _workListService.DeactivateAsync(workListId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "WorkList deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{workListId:long}/activate")]
    public async Task<IActionResult> Activate(long workListId, CancellationToken cancellationToken)
    {
        await _workListService.ActivateAsync(workListId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "WorkList activated successfully.", StatusCodes.Status200OK, null));
    }
}