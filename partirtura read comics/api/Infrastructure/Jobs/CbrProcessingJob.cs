using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Hangfire;
using ImageMagick;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SharpCompress.Archives;

namespace Infrastructure.Jobs;

public class CbrProcessingJob
{
    private const int BatchSize = 20;
    private const int DisableConcurrentExecutionTimeoutSeconds = 1800;

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CbrProcessingJob> _logger;
    private readonly IHostEnvironment _env;

    public CbrProcessingJob(IServiceProvider serviceProvider, ILogger<CbrProcessingJob> logger, IHostEnvironment env)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _env = env;
    }

    [Queue("cbr-processing")]
    [DisableConcurrentExecution(DisableConcurrentExecutionTimeoutSeconds)]
    public async Task ProcessCbrAsync(long workId, string cbrFilePath)
    {
        await ProcessCbrForWorkAsync(workId, cbrFilePath, "Work");
    }

    private async Task ProcessCbrForWorkAsync(long workId, string cbrFilePath, string workType)
    {
        if (!CbrFileValidator.IsPathWithinTempRoot(cbrFilePath, _env.ContentRootPath))
        {
            _logger.LogError("Rejected CBR processing for {WorkType} {WorkId}: path '{Path}' is outside temp root.", workType, workId, cbrFilePath);
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var repository = unitOfWork.WorkRepository;
        var imageRepository = unitOfWork.ImageRepository;
        var pageRepository = unitOfWork.PageRepository;
        var fileStorageService = scope.ServiceProvider.GetRequiredService<IFileStorageService>();

        var success = false;
        try
        {
            var work = await repository.GetByIdAsync(workId);
            if (work is null)
            {
                _logger.LogError("{WorkType} {WorkId} not found for CBR processing", workType, workId);
                return;
            }

            if (work.ContentStatus == ContentStatus.Completed && !System.IO.File.Exists(cbrFilePath))
            {
                _logger.LogInformation("{WorkType} {WorkId} is already Completed and source CBR no longer exists. Skipping.", workType, workId);
                return;
            }

            if (work.ContentStatus != ContentStatus.Processing)
            {
                work.ContentStatus = ContentStatus.Processing;
                work.ContentError = null;
                await repository.UpdateAsync(work);
                await unitOfWork.SaveChangesAsync();
            }

            await CleanupExistingContentAsync(work, fileStorageService, unitOfWork);

            int pageCount = await ProcessArchiveAsync(
                workId,
                cbrFilePath,
                work,
                fileStorageService,
                unitOfWork);

            work.ContentStatus = ContentStatus.Completed;
            work.ContentError = null;
            await repository.UpdateAsync(work);
            await unitOfWork.SaveChangesAsync();

            _logger.LogInformation("CBR processing completed for {WorkType} {WorkId}. {PageCount} pages processed.", workType, workId, pageCount);
            success = true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CBR processing failed for {WorkType} {WorkId}", workType, workId);

            try
            {
                var workForError = await repository.GetByIdAsync(workId);
                if (workForError is not null)
                {
                    workForError.ContentStatus = ContentStatus.Error;
                    workForError.ContentError = ex.Message.Length > 2000 ? ex.Message[..2000] : ex.Message;
                    await repository.UpdateAsync(workForError);
                    await unitOfWork.SaveChangesAsync();
                }
            }
            catch (Exception markEx)
            {
                _logger.LogError(markEx, "Failed to mark {WorkType} {WorkId} as Error after processing failure", workType, workId);
            }

            throw;
        }
        finally
        {
            if (success)
            {
                CleanupTempFile(cbrFilePath);
            }
        }
    }

    private async Task CleanupExistingContentAsync(
        Work work,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork)
    {
        if (work.Pages is null || work.Pages.Count == 0)
            return;

        foreach (var page in work.Pages)
        {
            if (page.Image is not null)
            {
                try
                {
                    await fileStorageService.DeleteAsync(page.Image.StoragePath);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete image file {StoragePath}", page.Image.StoragePath);
                }
                unitOfWork.ImageRepository.Remove(page.Image);
            }
        }

        foreach (var page in work.Pages)
        {
            unitOfWork.PageRepository.Remove(page);
        }

        work.Pages.Clear();
        await unitOfWork.SaveChangesAsync();
    }

    private async Task<int> ProcessArchiveAsync(
        long workId,
        string cbrFilePath,
        Work work,
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork)
    {
        int order = 1;

        using var cbrStream = System.IO.File.OpenRead(cbrFilePath);
        using var archive = ArchiveFactory.OpenArchive(cbrStream);

        var orderedEntries = archive.Entries
            .Where(e => !e.IsDirectory && CbrFileValidator.IsImageFile(e.Key))
            .OrderBy(e => e.Key, new NaturalSortComparer())
            .ToList();

        _logger.LogInformation("CBR processing started for {WorkType} {WorkId}. {EntryCount} image entries found.", work.GetType().Name, workId, orderedEntries.Count);

        foreach (var entry in orderedEntries)
        {
            var savedImage = await ProcessArchiveEntryAsync(entry, fileStorageService);
            await unitOfWork.ImageRepository.AddAsync(savedImage);
            await unitOfWork.SaveChangesAsync();

            var page = new Page
            {
                Work = work,
                Order = order,
                Image = savedImage
            };

            await unitOfWork.PageRepository.AddAsync(page);
            order++;

            _logger.LogInformation("{WorkType} {WorkId}: page {Order} image persisted.", work.GetType().Name, workId, order - 1);
        }

        await unitOfWork.SaveChangesAsync();

        _logger.LogInformation("CBR processing completed for {WorkType} {WorkId}. {PageCount} pages processed.", work.GetType().Name, workId, order - 1);
        return order - 1;
    }

    private static async Task<Image> ProcessArchiveEntryAsync(
        IArchiveEntry entry,
        IFileStorageService fileStorageService)
    {
        byte[] webpBytes;
        string webpFileName;

        using (var entryStream = entry.OpenEntryStream())
        using (var magickImage = new MagickImage(entryStream))
        {
            magickImage.Format = MagickFormat.WebP;
            webpBytes = magickImage.ToByteArray();
            webpFileName = $"{Path.GetFileNameWithoutExtension(entry.Key)}.webp";
        }

        return await fileStorageService.SaveAsync(
            webpBytes,
            webpFileName,
            ImageType.Page);
    }

    private void CleanupTempFile(string cbrFilePath)
    {
        try
        {
            if (System.IO.File.Exists(cbrFilePath))
            {
                System.IO.File.Delete(cbrFilePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not delete temp file {FilePath}", cbrFilePath);
        }
    }
}

internal class NaturalSortComparer : IComparer<string?>
{
    public int Compare(string? x, string? y)
    {
        if (x is null && y is null) return 0;
        if (x is null) return -1;
        if (y is null) return 1;

        int i = 0, j = 0;
        while (i < x.Length && j < y.Length)
        {
            if (char.IsDigit(x[i]) && char.IsDigit(y[j]))
            {
                int numX = 0, numY = 0;
                while (i < x.Length && char.IsDigit(x[i]))
                {
                    numX = numX * 10 + (x[i] - '0');
                    i++;
                }
                while (j < y.Length && char.IsDigit(y[j]))
                {
                    numY = numY * 10 + (y[j] - '0');
                    j++;
                }
                if (numX != numY) return numX.CompareTo(numY);
            }
            else
            {
                if (x[i] != y[j]) return x[i].CompareTo(y[j]);
                i++;
                j++;
            }
        }

        return x.Length.CompareTo(y.Length);
    }
}