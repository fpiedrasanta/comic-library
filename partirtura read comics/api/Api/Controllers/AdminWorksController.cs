using Api.DTOs;
using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.Json;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-works")]
[Authorize(Roles = Roles.Administrator)]
public class AdminWorksController : ControllerBase
{
    private readonly IWorkService _workService;
    private readonly IWorkContentService _workContentService;
    private readonly IPersonService _personService;
    private readonly IRoleService _roleService;

    public AdminWorksController(IWorkService workService, IWorkContentService workContentService, IPersonService personService, IRoleService roleService)
    {
        _workService = workService;
        _workContentService = workContentService;
        _personService = personService;
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetWorksRequest request, CancellationToken cancellationToken)
    {
        var result = await _workService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("{workId:long}")]
    public async Task<IActionResult> GetById(long workId, CancellationToken cancellationToken)
    {
        var result = await _workService.GetByIdAsync(workId, cancellationToken);
        if (result is null)
        {
            return NotFound(new ApiResponse<object>(false, "La obra no existe.", StatusCodes.Status404NotFound, null));
        }
        return Ok(new ApiResponse<WorkDetailDto>(true, "Work detail retrieved successfully.", StatusCodes.Status200OK, result));
    }

    [HttpGet("publisher/{publisherId:long}")]
    public async Task<IActionResult> GetByPublisher(long publisherId, [FromQuery] GetWorksRequest request, CancellationToken cancellationToken)
    {
        var filteredRequest = request with { publisherId = publisherId, franchiseId = null, seriesId = null };
        var result = await _workService.GetPagedAsync(filteredRequest, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("franchise/{franchiseId:long}")]
    public async Task<IActionResult> GetByFranchise(long franchiseId, [FromQuery] GetWorksRequest request, CancellationToken cancellationToken)
    {
        var filteredRequest = request with { franchiseId = franchiseId, publisherId = null, seriesId = null };
        var result = await _workService.GetPagedAsync(filteredRequest, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpGet("series/{seriesId:long}")]
    public async Task<IActionResult> GetBySeries(long seriesId, [FromQuery] GetWorksRequest request, CancellationToken cancellationToken)
    {
        var filteredRequest = request with { seriesId = seriesId, publisherId = null, franchiseId = null };
        var result = await _workService.GetPagedAsync(filteredRequest, cancellationToken);
        return Ok(new ApiResponse<ListResponse<WorkListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.AdminWorkCreate)]
    public async Task<IActionResult> Create([FromBody] CreateWorkRequest request, CancellationToken cancellationToken)
    {
        var result = await _workService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(GetById),
            routeValues: new { workId = result.Id },
            value: new ApiResponse<WorkDetailDto>(true, "Work created successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPost("with-content")]
    [EnableRateLimiting(RateLimitPolicies.AdminWorkCreate)]
    public async Task<IActionResult> CreateWithContent([FromForm] CreateWorkWithContentFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? contentData = null;
        string? contentFileName = null;

        if (request.Content is not null)
        {
            await using var stream = request.Content.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            contentData = ms.ToArray();
            contentFileName = request.Content.FileName;
        }

        byte[]? coverData = null;
        string? coverFileName = null;

        if (request.Cover is not null)
        {
            await using var stream = request.Cover.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            coverData = ms.ToArray();
            coverFileName = request.Cover.FileName;
        }

        var applicationRequest = new CreateWorkWithContentRequest(
            request.WorkTypeId,
            request.Title,
            request.LanguageId,
            request.PublicationDate,
            request.CoverImageId,
            request.SeriesId,
            request.FranchiseId,
            request.PublisherId,
            request.NumberValue,
            request.PreviousNumberId,
            request.NextNumberId,
            ParseJsonList<Application.DTOs.PersonByRoleRequest>(request.PersonByRoles)
                .Select(p => new Application.DTOs.PersonByRoleRequest(p.PersonId, p.RoleId)).ToList(),
            ParseJsonList<Application.DTOs.TagRequest>(request.Tags)
                .Select(t => new Application.DTOs.TagRequest(t.Id, t.Name)).ToList(),
            coverData,
            coverFileName,
            contentData,
            contentFileName);

        var result = await _workService.CreateWithContentAsync(applicationRequest, cancellationToken);
        return CreatedAtAction(
            actionName: nameof(GetById),
            routeValues: new { workId = result.Id },
            value: new ApiResponse<WorkDetailDto>(true, "Work created with content successfully.", StatusCodes.Status201Created, result));
    }

    [HttpPut("{workId:long}")]
    public async Task<IActionResult> Update(long workId, [FromBody] UpdateWorkRequest request, CancellationToken cancellationToken)
    {
        var result = await _workService.UpdateAsync(workId, request, cancellationToken);
        return Ok(new ApiResponse<WorkDetailDto>(true, "Work updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPut("{workId:long}/with-content")]
    public async Task<IActionResult> UpdateWithContent(long workId, [FromForm] UpdateWorkFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? coverData = null;
        string? coverFileName = null;

        if (request.Cover is not null)
        {
            await using var stream = request.Cover.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            coverData = ms.ToArray();
            coverFileName = request.Cover.FileName;
        }

        var applicationRequest = new UpdateWorkRequest(
            request.WorkTypeId,
            request.Title,
            request.Description,
            request.LanguageId,
            request.PublicationDate,
            request.CoverImageId,
            request.SeriesId,
            request.FranchiseId,
            request.PublisherId,
            request.NumberValue,
            request.PreviousNumberId,
            request.NextNumberId,
            ParseJsonList<Application.DTOs.PersonByRoleRequest>(request.PersonByRoles)
                .Select(p => new Application.DTOs.PersonByRoleRequest(p.PersonId, p.RoleId)).ToList(),
            ParseJsonList<Application.DTOs.TagRequest>(request.Tags)
                .Select(t => new Application.DTOs.TagRequest(t.Id, t.Name)).ToList(),
            coverData,
            coverFileName);

        var result = await _workService.UpdateAsync(workId, applicationRequest, cancellationToken);
        return Ok(new ApiResponse<WorkDetailDto>(true, "Work updated successfully.", StatusCodes.Status200OK, result));
    }

    [HttpPatch("{workId:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long workId, CancellationToken cancellationToken)
    {
        await _workService.DeactivateAsync(workId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPatch("{workId:long}/activate")]
    public async Task<IActionResult> Activate(long workId, CancellationToken cancellationToken)
    {
        await _workService.ActivateAsync(workId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work activated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpDelete("{workId:long}")]
    public async Task<IActionResult> Delete(long workId, CancellationToken cancellationToken)
    {
        await _workService.DeactivateAsync(workId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Work deleted successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPatch("{workId:long}/cover")]
    public async Task<IActionResult> SetCover(long workId, [FromBody] Application.DTOs.SetCoverRequest request, CancellationToken cancellationToken)
    {
        await _workContentService.SetCoverAsync(workId, request.ImageId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Cover updated successfully.", StatusCodes.Status200OK, null));
    }

    [HttpPost("{workId:long}/content/retry")]
    public async Task<IActionResult> RetryContent(long workId, [FromForm] RetryContentFormRequest request, CancellationToken cancellationToken)
    {
        if (request.Content is null || request.Content.Length == 0)
        {
            return BadRequest(new ApiResponse<object>(false, "Content file is required.", StatusCodes.Status400BadRequest, null));
        }

        await using var stream = request.Content.OpenReadStream();
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms, cancellationToken);
        var fileData = ms.ToArray();
        var fileName = request.Content.FileName;

        await _workContentService.RetryContentAsync(workId, fileData, fileName, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Content processing retry started.", StatusCodes.Status200OK, null));
    }

    [HttpPost("person-and-rol")]
    public async Task<IActionResult> EnsurePersonAndRole([FromBody] EnsurePersonRoleRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.PersonName) || string.IsNullOrWhiteSpace(request.RoleName))
        {
            return BadRequest(new ApiResponse<object>(false, "personName and roleName are required.", StatusCodes.Status400BadRequest, null));
        }

        var person = await _personService.EnsurePersonAsync(request.PersonName, cancellationToken);
        var role = await _roleService.EnsureRoleAsync(request.RoleName, cancellationToken);

        var response = new EnsurePersonRoleResponse
        {
            Person = new PersonResponse { Id = person.Id, Name = person.Name },
            Role = new RoleResponse { Id = role.Id, Name = role.Name }
        };

        return Ok(new ApiResponse<EnsurePersonRoleResponse>(true, "Person and role ensured successfully.", StatusCodes.Status200OK, response));
    }

    [HttpGet("{workId:long}/images")]
    public async Task<IActionResult> GetImages(long workId, CancellationToken cancellationToken)
    {
        var result = await _workContentService.GetImagesAsync(workId, cancellationToken);
        return Ok(new ApiResponse<WorkImagesResponse>(true, "Work images retrieved successfully.", StatusCodes.Status200OK, result));
    }

    private static List<T> ParseJsonList<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new List<T>();
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        return JsonSerializer.Deserialize<List<T>>(json, options) ?? new List<T>();
    }
}