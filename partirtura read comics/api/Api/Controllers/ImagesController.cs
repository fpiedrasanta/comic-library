using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/images")]
public class ImagesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;

    public ImagesController(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetImage(long id, CancellationToken cancellationToken)
    {
        var image = await _unitOfWork.ImageRepository.GetByIdAsync(id, cancellationToken);
        if (image is null)
        {
            return NotFound();
        }

        var physicalPath = _fileStorageService.GetPhysicalPath(image.StoragePath);

        if (string.IsNullOrWhiteSpace(physicalPath) || !System.IO.File.Exists(physicalPath))
        {
            return NotFound();
        }

        var contentType = string.IsNullOrWhiteSpace(image.ContentType) ? "application/octet-stream" : image.ContentType;
        return PhysicalFile(physicalPath, contentType);
    }
}
