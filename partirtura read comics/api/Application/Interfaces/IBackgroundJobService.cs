namespace Application.Interfaces;

public interface IBackgroundJobService
{
    string EnqueueCbrProcessing(long workId, string cbrFilePath);

    string EnqueueWorkAnalysis(long workId, IReadOnlyList<long> imageIds);
}