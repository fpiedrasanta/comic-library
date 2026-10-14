using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class AIService : IAIService
{
    private readonly IAIProviderResolver _providerResolver;
    private readonly AIProviderOptions _options;
    private readonly ILogger<AIService> _logger;

    public AIService(
        IAIProviderResolver providerResolver,
        AIProviderOptions options,
        ILogger<AIService> logger)
    {
        _providerResolver = providerResolver;
        _options = options;
        _logger = logger;
    }

    public async Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken cancellationToken = default)
    {
        var provider = _providerResolver.ResolveProvider(_options.Provider);
        _logger.LogInformation("Sending AI request to {Provider} using model {Model}", provider.ProviderName, _options.Model);
        return await provider.CompleteAsync(request, cancellationToken);
    }
}

public class AIProviderOptions
{
    public const string SectionName = "AI";

    public string Provider { get; set; } = "Gemini";
    public string Model { get; set; } = "gemini-3.1-flash-lite";
    public GeminiOptions Gemini { get; set; } = new();
    public OpenRouterOptions OpenRouter { get; set; } = new();
    public OllamaOptions Ollama { get; set; } = new();
}

public class GeminiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "https://generativelanguage.googleapis.com";
}

public class OpenRouterOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Endpoint { get; set; } = "https://openrouter.ai/api/v1";
}

public class OllamaOptions
{
    public string Endpoint { get; set; } = "http://localhost:11434";
}