using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Api.Controllers;

[ApiController]
[Route("api/users/me/lists")]
[Authorize]
public class MyListsController : ControllerBase
{
    private readonly IPersonalListService _personalListService;

    public MyListsController(IPersonalListService personalListService)
    {
        _personalListService = personalListService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonalListRequest request, CancellationToken cancellationToken)
    {
        var result = await _personalListService.CreateAsync(request, GetUserId(), cancellationToken);

        return CreatedAtAction(
            actionName: nameof(GetById),
            routeValues: new { listId = result.Id },
            value: new ApiResponse<PersonalListSummaryDto>(true, "Personal list created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetPersonalListsRequest request, CancellationToken cancellationToken)
    {
        var result = await _personalListService.GetWithMembershipAsync(request, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<IReadOnlyList<PersonalListMembershipDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{listId:long}")]
    public async Task<IActionResult> GetById(long listId, CancellationToken cancellationToken)
    {
        var result = await _personalListService.GetSummaryAsync(listId, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<PersonalListSummaryDto>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPut("{listId:long}")]
    public async Task<IActionResult> Update(long listId, [FromBody] UpdatePersonalListRequest request, CancellationToken cancellationToken)
    {
        var result = await _personalListService.RenameAsync(listId, request, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<PersonalListSummaryDto>(true, "Personal list updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpDelete("{listId:long}")]
    public async Task<IActionResult> Delete(long listId, CancellationToken cancellationToken)
    {
        await _personalListService.DeleteAsync(listId, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<object>(true, "Personal list deleted successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{listId:long}/works")]
    public async Task<IActionResult> AddWork(long listId, [FromBody] AddWorkToPersonalListRequest request, CancellationToken cancellationToken)
    {
        var result = await _personalListService.AddWorkAsync(listId, request, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<PersonalListSummaryDto>(true, "Work added to the personal list successfully.", StatusCodes.Status200OK, result));
    }

    [HttpDelete("{listId:long}/works/{workId:long}")]
    public async Task<IActionResult> RemoveWork(long listId, long workId, CancellationToken cancellationToken)
    {
        await _personalListService.RemoveWorkAsync(listId, workId, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work removed from the personal list successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPut("{listId:long}/works/order")]
    public async Task<IActionResult> ReorderWorks(long listId, [FromBody] ReorderPersonalListWorksRequest request, CancellationToken cancellationToken)
    {
        await _personalListService.ReorderWorksAsync(listId, request, GetUserId(), cancellationToken);
        return Ok(new ApiResponse<object>(true, "Personal list order updated successfully.", StatusCodes.Status200OK, null));
    }

    private long GetUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        return long.TryParse(userIdClaim, out var parsedId) ? parsedId : 0;
    }
}
