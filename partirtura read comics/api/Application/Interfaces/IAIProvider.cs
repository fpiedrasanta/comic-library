using Application.DTOs;

namespace Application.Interfaces;

public interface IAIProvider
{
    string ProviderName { get; }
    Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken cancellationToken = default);
}
