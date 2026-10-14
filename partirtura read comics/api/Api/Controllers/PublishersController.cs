using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/publishers")]
[Authorize]
public class PublishersController : ControllerBase
{
    private readonly IPublisherService _publisherService;

    public PublishersController(IPublisherService publisherService)
    {
        _publisherService = publisherService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ListRequest request, CancellationToken cancellationToken)
    {
        var result = await _publisherService.GetPublicPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<PublisherFilterDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        var result = await _publisherService.GetPublicDetailAsync(id, cancellationToken);
        return Ok(new ApiResponse<PublisherDetailDto>(true, "OK", StatusCodes.Status200OK, result));
    }
}