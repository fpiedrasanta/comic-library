using Application.DTOs;

namespace Application.Interfaces;

public interface IWorkAnalysisService
{
    Task<ComicAnalysisResult> AnalyzeWithAiAsync(long workId, AnalyzeComicRequest request, CancellationToken cancellationToken = default);
}
