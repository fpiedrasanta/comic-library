using Application.Interfaces;
using Hangfire;
using Infrastructure.Jobs;

namespace Infrastructure.Services;

public class BackgroundJobService : IBackgroundJobService
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public BackgroundJobService(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public string EnqueueCbrProcessing(long workId, string cbrFilePath)
    {
        return _backgroundJobClient.Enqueue<CbrProcessingJob>(job =>
            job.ProcessCbrAsync(workId, cbrFilePath));
    }

    public string EnqueueWorkAnalysis(long workId, IReadOnlyList<long> imageIds)
    {
        return _backgroundJobClient.Enqueue<WorkAnalysisJob>(job =>
            job.ProcessAsync(workId, imageIds));
    }
}