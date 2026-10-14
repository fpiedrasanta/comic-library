using Hangfire;
using Infrastructure.Jobs;
using Xunit;

namespace Infrastructure.Tests.Jobs;

public class CbrProcessingJobPolicyTests
{
    [Fact]
    public void BatchSize_IsAtLeastOne()
    {
        var batchSize = typeof(CbrProcessingJob)
            .GetField("BatchSize", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
            .GetValue(null);

        Assert.NotNull(batchSize);
        Assert.IsType<int>(batchSize);
        Assert.True((int)batchSize >= 1, "BatchSize must be at least 1 to avoid infinite SaveChanges in empty loop.");
    }

    [Fact]
    public void BatchSize_IsReasonable()
    {
        var batchSize = (int)typeof(CbrProcessingJob)
            .GetField("BatchSize", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
            .GetValue(null)!;

        Assert.InRange(batchSize, 5, 200);
    }

    [Fact]
    public void DisableConcurrentExecutionTimeout_IsAtLeast30Minutes()
    {
        var seconds = (int)typeof(CbrProcessingJob)
            .GetField("DisableConcurrentExecutionTimeoutSeconds", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
            .GetValue(null)!;

        Assert.True(seconds >= 1800, "Timeout must be at least 30 min so a large CBR doesn't get pre-empted.");
        Assert.True(seconds <= 86400, "Timeout must not exceed 24h to avoid stuck locks.");
    }

    [Fact]
    public void ProcessCbrAsync_HasDisableConcurrentExecutionAttribute()
    {
        var method = typeof(CbrProcessingJob).GetMethod(nameof(CbrProcessingJob.ProcessCbrAsync));
        Assert.NotNull(method);

        var attr = method!
            .GetCustomAttributes(typeof(DisableConcurrentExecutionAttribute), inherit: true)
            .OfType<DisableConcurrentExecutionAttribute>()
            .FirstOrDefault();

        Assert.NotNull(attr);
    }

    [Fact]
    public void ProcessCbrAsync_HasQueueAttribute()
    {
        var method = typeof(CbrProcessingJob).GetMethod(nameof(CbrProcessingJob.ProcessCbrAsync));
        Assert.NotNull(method);

        var attr = method!
            .GetCustomAttributes(typeof(QueueAttribute), inherit: true)
            .OfType<QueueAttribute>()
            .FirstOrDefault();

        Assert.NotNull(attr);
        Assert.Equal("cbr-processing", attr!.Queue);
    }
}
