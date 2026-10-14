using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/work-types")]
[Authorize]
public class WorkTypesController : ControllerBase
{
    private readonly IWorkTypeService _workTypeService;

    public WorkTypesController(IWorkTypeService workTypeService)
    {
        _workTypeService = workTypeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ListRequest request, CancellationToken cancellationToken)
    {
        var result = await _workTypeService.GetPublicPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkTypeFilterDto>>(true, "OK", StatusCodes.Status200OK, result));
    }
}