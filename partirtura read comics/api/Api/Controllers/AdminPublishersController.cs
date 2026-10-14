using Api.DTOs;
using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Application.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace Api.Controllers;

[ApiController]
[Route("api/admin-publishers")]
public class AdminPublishersController : ControllerBase
{
    private readonly IPublisherService _publisherService;

    public AdminPublishersController(IPublisherService publisherService)
    {
        _publisherService = publisherService;
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpGet]
    public async Task<IActionResult> GetAdminPublishers([FromQuery] GetPublishersRequest request, CancellationToken cancellationToken)
    {
        var result = await _publisherService.GetPagedAsync(request, cancellationToken);
        return Ok(new ApiResponse<ListResponse<AdminPublisherListItemDto>>(true, "OK", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpGet("{publisherId:long}")]
    public async Task<IActionResult> GetPublisherDetail(long publisherId, CancellationToken cancellationToken)
    {
        var result = await _publisherService.GetPublisherDetailAsync(publisherId, cancellationToken);
        return Ok(new ApiResponse<AdminPublisherDetailDto>(true, "Publisher detail retrieved successfully.", StatusCodes.Status200OK, result));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPost]
    public async Task<IActionResult> CreatePublisher([FromForm] CreatePublisherFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new Application.DTOs.CreatePublisherRequest(
            request.Name,
            request.Description,
            request.Website,
            request.CountryId,
            request.FoundedYear,
            request.History,
            request.IsAlive,
            avatarData,
            avatarFileName,
            request.Color,
            request.IsFeatured);

        var publisher = await _publisherService.CreatePublisherAsync(applicationRequest, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Publisher created successfully.", StatusCodes.Status200OK, new { id = publisher.Id }));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPut("{publisherId:long}")]
    public async Task<IActionResult> UpdatePublisher(long publisherId, [FromForm] UpdatePublisherFormRequest request, CancellationToken cancellationToken)
    {
        byte[]? avatarData = null;
        string? avatarFileName = null;

        if (request.Avatar is not null)
        {
            await using var stream = request.Avatar.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            avatarData = ms.ToArray();
            avatarFileName = request.Avatar.FileName;
        }

        var applicationRequest = new Application.DTOs.UpdatePublisherRequest(
            request.Name,
            request.Description,
            request.Website,
            request.CountryId,
            request.FoundedYear,
            request.History,
            request.IsAlive,
            request.ImageId,
            avatarData,
            avatarFileName,
            request.Color,
            request.IsFeatured);

        var publisher = await _publisherService.UpdatePublisherAsync(publisherId, applicationRequest, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Publisher updated successfully.", StatusCodes.Status200OK, new { id = publisher.Id }));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPatch("{publisherId:long}/deactivate")]
    public async Task<IActionResult> DeactivatePublisher(long publisherId, CancellationToken cancellationToken)
    {
        await _publisherService.DeactivatePublisherAsync(publisherId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Publisher deactivated successfully.", StatusCodes.Status200OK, null));
    }

    [Authorize(Roles = Roles.Administrator)]
    [HttpPatch("{publisherId:long}/activate")]
    public async Task<IActionResult> ActivatePublisher(long publisherId, CancellationToken cancellationToken)
    {
        await _publisherService.ActivatePublisherAsync(publisherId, cancellationToken);
        return Ok(new ApiResponse<object>(true, "Publisher activated successfully.", StatusCodes.Status200OK, null));
    }
}
