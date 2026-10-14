using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-list-types")]
[Authorize(Roles = Roles.Administrator)]
public class AdminListTypesController : ControllerBase
{
    private readonly IListTypeService _listTypeService;

    public AdminListTypesController(IListTypeService listTypeService)
    {
        _listTypeService = listTypeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetListTypesRequest request, CancellationToken cancellationToken)
    {
        var result = await _listTypeService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<ListTypeListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateListTypeRequest request, CancellationToken cancellationToken)
    {
        var result = await _listTypeService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(Get),
            routeValues: new { id = result.Id },
            value: new ApiResponse<ListTypeListItemDto>(true, "ListType created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{listTypeId:long}")]
    public async Task<IActionResult> Update(long listTypeId, [FromBody] UpdateListTypeRequest request, CancellationToken cancellationToken)
    {
        await _listTypeService.UpdateAsync(listTypeId, request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "ListType updated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{listTypeId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long listTypeId, CancellationToken cancellationToken)
    {
        await _listTypeService.DeactivateAsync(listTypeId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "ListType deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{listTypeId:long}/activate")]
    public async Task<IActionResult> Activate(long listTypeId, CancellationToken cancellationToken)
    {
        await _listTypeService.ActivateAsync(listTypeId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "ListType activated successfully.", StatusCodes.Status200OK, null));
    }
}
