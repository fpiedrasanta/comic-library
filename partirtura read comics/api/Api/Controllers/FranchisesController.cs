using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/franchises")]
[Authorize]
public class FranchisesController : ControllerBase
{
    private readonly IFranchiseService _franchiseService;

    public FranchisesController(IFranchiseService franchiseService)
    {
        _franchiseService = franchiseService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetPublicFranchisesRequest request, CancellationToken cancellationToken)
    {
        var result = await _franchiseService.GetPublicPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<FranchiseFilterDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        var result = await _franchiseService.GetPublicDetailAsync(id, cancellationToken);
        return Ok(new ApiResponse<PublicFranchiseDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }
}