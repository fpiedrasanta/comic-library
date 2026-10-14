using Application.DTOs;
using Application.Interfaces;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class WorkContentService : IWorkContentService
{
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<WorkContentService> _logger;

    public WorkContentService(
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        IBackgroundJobService backgroundJobService,
        ILogger<WorkContentService> logger)
    {
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task UploadCbrAsync(long workId, byte[] fileData, string fileName, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (fileData is null || fileData.Length == 0)
        {
            throw new ValidationException("El archivo CBR es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        var tempFolder = Path.Combine("Storage", "Temp", workId.ToString());
        var cbrFilePath = await _fileStorageService.SaveFileAsync(fileData, fileName, tempFolder, cancellationToken);

        _logger.LogInformation("Saving CBR file for Work {WorkId} to {FilePath}. Enqueuing background job.", workId, cbrFilePath);
        var jobId = _backgroundJobService.EnqueueCbrProcessing(workId, cbrFilePath);
        _logger.LogInformation("CBR processing job enqueued for Work {WorkId}. JobId={JobId}", workId, jobId);
    }

    public async Task<ContentStatusDto> GetContentStatusAsync(long workId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        var status = work.ContentStatus switch
        {
            ContentStatus.Missing => "Missing",
            ContentStatus.Processing => "Processing",
            ContentStatus.Completed => "Completed",
            ContentStatus.Error => "Error",
            _ => "Missing"
        };

        return new ContentStatusDto(
            status,
            work.ContentError,
            null,
            null,
            work.Pages.Count);
    }

    public async Task RetryContentAsync(long workId, byte[] fileData, string fileName, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (fileData is null || fileData.Length == 0)
        {
            throw new ValidationException("El archivo CBR es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        if (work.ContentStatus == ContentStatus.Processing)
        {
            _logger.LogWarning("Retry requested for Work {WorkId} while processing. A previous job may still be running.", workId);
        }

        foreach (var page in work.Pages.ToList())
        {
            if (page.Image is not null)
            {
                await _fileStorageService.DeleteAsync(page.Image.StoragePath, cancellationToken);
                _unitOfWork.ImageRepository.Remove(page.Image);
            }
        }

        var pages = await _unitOfWork.PageRepository.GetByWorkIdAsync(workId, cancellationToken);
        foreach (var page in pages)
        {
            _unitOfWork.PageRepository.Remove(page);
        }

        work.ContentStatus = ContentStatus.Missing;
        work.ContentError = null;
        await _unitOfWork.WorkRepository.UpdateAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var tempFolder = Path.Combine("Storage", "Temp", workId.ToString());
        var cbrFilePath = await _fileStorageService.SaveFileAsync(fileData, fileName, tempFolder, cancellationToken);

        _logger.LogInformation("Retrying CBR processing for Work {WorkId}. New file: {FilePath}", workId, cbrFilePath);
        _backgroundJobService.EnqueueCbrProcessing(workId, cbrFilePath);
    }

    public async Task DeleteContentAsync(long workId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        if (work.ContentStatus == ContentStatus.Processing)
        {
            throw new BusinessConflictException("No se puede eliminar el contenido mientras se está procesando.");
        }

        foreach (var page in work.Pages.ToList())
        {
            if (page.Image is not null)
            {
                await _fileStorageService.DeleteAsync(page.Image.StoragePath, cancellationToken);
                _unitOfWork.ImageRepository.Remove(page.Image);
            }
        }

        var pages = await _unitOfWork.PageRepository.GetByWorkIdAsync(workId, cancellationToken);
        foreach (var page in pages)
        {
            _unitOfWork.PageRepository.Remove(page);
        }

        work.ContentStatus = ContentStatus.Missing;
        work.ContentError = null;
        await _unitOfWork.WorkRepository.UpdateAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<WorkImagesResponse> GetImagesAsync(long workId, CancellationToken cancellationToken = default)
    {
        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        var images = work.Pages
            .OrderBy(p => p.Order)
            .Select(p => new WorkImageItemDto(p.Image.Id, $"/images/{p.Image.Id}"))
            .ToList();

        return new WorkImagesResponse(images);
    }

    public async Task SetCoverAsync(long workId, long imageId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (imageId <= 0)
        {
            throw new ValidationException("El identificador de la imagen es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        var isOwnedImage = work.Pages.Any(p => p.Image.Id == imageId);
        if (!isOwnedImage)
        {
            throw new BusinessNotFoundException("La imagen no pertenece al contenido de la obra.");
        }

        var image = await _unitOfWork.ImageRepository.GetByIdAsync(imageId, cancellationToken)
            ?? throw new BusinessNotFoundException("La imagen no existe.");

        work.Cover = image;
        await _unitOfWork.WorkRepository.UpdateAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}