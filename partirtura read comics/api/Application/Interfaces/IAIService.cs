using Application.DTOs;

namespace Application.Interfaces;

public interface IAIService
{
    Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken cancellationToken = default);
}