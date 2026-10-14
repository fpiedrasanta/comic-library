using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-persons")]
[Authorize(Roles = Roles.Administrator)]
public class AdminPersonsController : ControllerBase
{
    private readonly IPersonService _personService;

    public AdminPersonsController(IPersonService personService)
    {
        _personService = personService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetPersonsRequest request, CancellationToken cancellationToken)
    {
        var result = await _personService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<PersonListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePersonRequest request, CancellationToken cancellationToken)
    {
        var result = await _personService.CreatePersonAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, new ApiResponse<PersonListItemDto>(true, "Person created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdatePersonRequest request, CancellationToken cancellationToken)
    {
        var result = await _personService.UpdatePersonAsync(id, request, cancellationToken);
        return Ok(new ApiResponse<PersonListItemDto>(true, "Person updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPost("{id:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long id, CancellationToken cancellationToken)
    {
        await _personService.DeactivatePersonAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:long}/activate")]
    public async Task<IActionResult> Activate(long id, CancellationToken cancellationToken)
    {
        await _personService.ActivatePersonAsync(id, cancellationToken);
        return NoContent();
    }
}
