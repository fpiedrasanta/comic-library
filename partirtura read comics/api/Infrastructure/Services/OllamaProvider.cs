using System.Text.Json;
using Application.DTOs;
using Application.Services;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class OllamaProvider : HttpAIProviderBase
{
    public OllamaProvider(HttpClient httpClient, AIProviderOptions options, ILogger<OllamaProvider> logger)
        : base(httpClient, options, logger)
    {
    }

    public override string ProviderName => "Ollama";

    protected override (string Endpoint, string JsonBody) BuildRequest(string model, AIRequest request)
    {
        var endpoint = "/api/generate";

        var parts = new List<object>
        {
            new { text = request.Prompt }
        };

        if (request.Images is { Count: > 0 })
        {
            foreach (var image in request.Images)
            {
                parts.Add(new
                {
                    inline_data = new
                    {
                        mime_type = image.MimeType,
                        data = Convert.ToBase64String(image.Data)
                    }
                });
            }
        }

        var payload = new
        {
            model = model,
            prompt = request.Prompt,
            images = request.Images?.Select(i => Convert.ToBase64String(i.Data)).ToArray(),
            stream = false
        };

        return (endpoint, ToJson(payload));
    }

    protected override void ApplyAuthHeader(HttpRequestMessage request)
    {
    }

    protected override string ExtractContent(string responseJson)
    {
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("response", out var response))
        {
            return response.GetString() ?? string.Empty;
        }

        return string.Empty;
    }
}
