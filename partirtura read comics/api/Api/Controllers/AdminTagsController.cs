using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-tags")]
[Authorize(Roles = Roles.Administrator)]
public class AdminTagsController : ControllerBase
{
    private readonly ITagService _tagService;

    public AdminTagsController(ITagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetTagsRequest request, CancellationToken cancellationToken)
    {
        var result = await _tagService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<TagListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTagRequest request, CancellationToken cancellationToken)
    {
        var result = await _tagService.CreateTagAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(Get),
            routeValues: new { id = result.Id },
            value: new ApiResponse<TagListItemDto>(true, "Tag created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{tagId:long}")]
    public async Task<IActionResult> Update(long tagId, [FromBody] UpdateTagRequest request, CancellationToken cancellationToken)
    {
        await _tagService.UpdateTagAsync(tagId, request, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Tag updated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{tagId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long tagId, CancellationToken cancellationToken)
    {
        await _tagService.DeactivateTagAsync(tagId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Tag deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{tagId:long}/activate")]
    public async Task<IActionResult> Activate(long tagId, CancellationToken cancellationToken)
    {
        await _tagService.ActivateTagAsync(tagId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Tag activated successfully.", StatusCodes.Status200OK, null));
    }
}