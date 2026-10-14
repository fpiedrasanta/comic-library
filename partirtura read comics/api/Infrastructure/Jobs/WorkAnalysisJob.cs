using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Infrastructure.Jobs;

[Queue("ai-analysis")]
public class WorkAnalysisJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WorkAnalysisJob> _logger;
    private static readonly Random _random = new();

    public WorkAnalysisJob(IServiceProvider serviceProvider, ILogger<WorkAnalysisJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task ProcessAsync(long workId, IReadOnlyList<long> imageIds)
    {
        if (workId <= 0)
        {
            _logger.LogWarning("WorkAnalysisJob received invalid WorkId: {WorkId}", workId);
            return;
        }

        if (imageIds is null || imageIds.Count == 0)
        {
            _logger.LogWarning("WorkAnalysisJob received empty ImageIds for WorkId: {WorkId}", workId);
            return;
        }

        await ProcessWorkAnalysisAsync(workId, imageIds);
    }

    private async Task ProcessWorkAnalysisAsync(long workId, IReadOnlyList<long> imageIds)
    {
        using var scope = _serviceProvider.CreateScope();
        var analyzer = scope.ServiceProvider.GetRequiredService<WorkAnalyzer>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var workRepository = unitOfWork.WorkRepository;

        // 1. Establecer estado Processing y persistir antes de llamar al proveedor IA
        var work = await workRepository.GetByIdAsync(workId);
        if (work is null)
        {
            _logger.LogWarning("Work {WorkId} not found at job start. Setting Error status.", workId);
            await SetErrorStatusAsync(workId); // Will handle null gracefully
            return; // No retry for non-existent work
        }

        work.IAStatus = IAProcessingStatus.Processing;
        await workRepository.UpdateAsync(work);
        await unitOfWork.SaveChangesAsync();

        _logger.LogInformation("AI analysis started for Work {WorkId}", workId);

        try
        {
            var analysis = await analyzer.AnalyzeAsync(workId, imageIds);

            if (analysis is null)
            {
                // Analyzer returned null = validation error (work not found, not completed, invalid images, missing files)
                // These are non-provider errors: set Error, no retry
                _logger.LogWarning("Analysis validation failed for Work {WorkId}. Setting Error status.", workId);
                await SetErrorStatusAsync(workId);
                return;
            }

            var json = JsonSerializer.Serialize(analysis, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            // 2. Persist successful result
            work = await workRepository.GetByIdAsync(workId);
            if (work is null)
            {
                _logger.LogError("Work {WorkId} disappeared after successful AI analysis. Setting Error status.", workId);
                await SetErrorStatusAsync(workId); // Will handle null gracefully
                return;
            }

            work.IAStatus = IAProcessingStatus.Success;
            work.IAResult = json;
            await workRepository.UpdateAsync(work);
            await unitOfWork.SaveChangesAsync();

            _logger.LogInformation("AI analysis completed and persisted for Work {WorkId}", workId);
        }
        catch (AIProviderException ex)
        {
            // 3. AI provider error: keep Processing, schedule retry
            _logger.LogWarning(ex, "AI provider error for Work {WorkId} (Provider: {Provider}, StatusCode: {StatusCode}). Keeping Processing status and scheduling retry.", workId, ex.ProviderName, ex.StatusCode);
            
            work = await workRepository.GetByIdAsync(workId);
            if (work is not null)
            {
                // Keep IAStatus = Processing, clear any partial result
                work.IAStatus = IAProcessingStatus.Processing;
                work.IAResult = null;
                await workRepository.UpdateAsync(work);
                await unitOfWork.SaveChangesAsync();
            }
            
            ScheduleRetry(workId, imageIds);
        }
        catch (Exception ex)
        {
            // 4. Any other error: set Error, no retry
            _logger.LogError(ex, "Non-provider error processing AI analysis for Work {WorkId}. Setting Error status.", workId);
            await SetErrorStatusAsync(workId);
        }
    }

    private async Task SetErrorStatusAsync(long workId)
    {
        using var scope = _serviceProvider.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var workRepository = unitOfWork.WorkRepository;

        var work = await workRepository.GetByIdAsync(workId);
        if (work is not null)
        {
            work.IAStatus = IAProcessingStatus.Error;
            work.IAResult = null;
            await workRepository.UpdateAsync(work);
            await unitOfWork.SaveChangesAsync();
        }
        else
        {
            _logger.LogWarning("Cannot set Error status for Work {WorkId}: work no longer exists in database.", workId);
        }
    }

    private void ScheduleRetry(long workId, IReadOnlyList<long> imageIds)
    {
        var delayMinutes = _random.Next(1, 11);
        var delay = TimeSpan.FromMinutes(delayMinutes);

        BackgroundJob.Schedule<WorkAnalysisJob>(
            job => job.ProcessAsync(workId, imageIds),
            delay);

        _logger.LogInformation("Scheduled retry for Work {WorkId} in {DelayMinutes} minutes", workId, delayMinutes);
    }
}