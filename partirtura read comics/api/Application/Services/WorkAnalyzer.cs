using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public sealed class WorkAnalyzer
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IAIService _aiService;
    private readonly ILogger<WorkAnalyzer> _logger;

    public WorkAnalyzer(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        IAIService aiService,
        ILogger<WorkAnalyzer> logger)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<ComicAnalysisResult?> AnalyzeAsync(long workId, IReadOnlyList<long> imageIds, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            _logger.LogWarning("WorkAnalyzer received invalid WorkId: {WorkId}", workId);
            return null;
        }

        if (imageIds is null || imageIds.Count == 0)
        {
            _logger.LogWarning("WorkAnalyzer received empty ImageIds for WorkId: {WorkId}", workId);
            return null;
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken);
        if (work is null)
        {
            _logger.LogInformation("Work {WorkId} not found", workId);
            return null;
        }

        if (work.ContentStatus != ContentStatus.Completed)
        {
            _logger.LogWarning("Work {WorkId} is not in Completed status (current: {Status})", workId, work.ContentStatus);
            return null;
        }

        var pages = work.Pages.OrderBy(p => p.Order).ToList();
        var selectedPages = pages.Where(p => p.Image is not null && imageIds.Contains(p.Image.Id)).ToList();

        if (selectedPages.Count != imageIds.Count)
        {
            _logger.LogWarning("One or more images do not belong to Work {WorkId}. Requested: {RequestedCount}, Found: {FoundCount}",
                workId, imageIds.Count, selectedPages.Count);
            return null;
        }

        var imageParts = new List<AIImagePart>();
        foreach (var page in selectedPages)
        {
            var image = page.Image!;
            var physicalPath = _fileStorageService.GetPhysicalPath(image.StoragePath);
            if (!System.IO.File.Exists(physicalPath))
            {
                _logger.LogError("Physical file not found for Image {ImageId} at path {Path}", image.Id, physicalPath);
                return null;
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(physicalPath, cancellationToken);
            imageParts.Add(new AIImagePart(image.ContentType, bytes));
        }

        var language = work.Language?.Name ?? "Español";
        var prompt = ComicAnalysisParser.BuildPrompt(language);
        var aiRequest = new AIRequest(prompt, imageParts);

        _logger.LogInformation("Starting AI analysis for Work {WorkId} with {ImageCount} images", workId, imageParts.Count);

        AIResponse aiResponse;
        try
        {
            aiResponse = await _aiService.CompleteAsync(aiRequest, cancellationToken);
        }
        catch (AIProviderException)
        {
            throw; // Re-throw provider exceptions as-is
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or TimeoutException)
        {
            // Wrap network/timeout exceptions as provider exceptions
            _logger.LogError(ex, "AI provider communication failed for Work {WorkId}", workId);
            throw new AIProviderException("Unknown", "AI provider communication failed", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error calling AI provider for Work {WorkId}", workId);
            throw new AIProviderException("Unknown", "Unexpected error calling AI provider", ex);
        }

        if (!ComicAnalysisParser.TryParse(aiResponse.Content, out var analysis))
        {
            _logger.LogWarning("AI returned invalid/unparsable response for Work {WorkId}", workId);
            return null;
        }

        return analysis;
    }
}