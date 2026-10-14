using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/list-types")]
[Authorize]
public class ListTypesController : ControllerBase
{
    private readonly IListTypeService _listTypeService;

    public ListTypesController(IListTypeService listTypeService)
    {
        _listTypeService = listTypeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ListRequest request, CancellationToken cancellationToken)
    {
        var result = await _listTypeService.GetPublicPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<ListTypeFilterDto>>(true, "OK", StatusCodes.Status200OK, result));
    }
}
