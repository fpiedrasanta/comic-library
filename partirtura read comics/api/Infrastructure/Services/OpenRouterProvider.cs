using System.Text.Json;
using Application.DTOs;
using Application.Services;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class OpenRouterProvider : HttpAIProviderBase
{
    public OpenRouterProvider(HttpClient httpClient, AIProviderOptions options, ILogger<OpenRouterProvider> logger)
        : base(httpClient, options, logger)
    {
    }

    public override string ProviderName => "OpenRouter";

    protected override (string Endpoint, string JsonBody) BuildRequest(string model, AIRequest request)
    {
        var endpoint = "https://openrouter.ai/api/v1/chat/completions";

        var contentParts = new List<object>
        {
            new { type = "text", text = request.Prompt }
        };

        if (request.Images is { Count: > 0 })
        {
            foreach (var image in request.Images)
            {
                var dataUrl = $"data:{image.MimeType};base64,{Convert.ToBase64String(image.Data)}";
                contentParts.Add(new
                {
                    type = "image_url",
                    image_url = new { url = dataUrl }
                });
            }
        }

        var payload = new
        {
            model = model,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = contentParts
                }
            }
        };

        return (endpoint, ToJson(payload));
    }

    protected override void ApplyAuthHeader(HttpRequestMessage request)
    {
        var key = Options.OpenRouter.ApiKey;
        if (!string.IsNullOrWhiteSpace(key))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", key);
        }
    }

    protected override string ExtractContent(string responseJson)
    {
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var first = choices[0];
            if (first.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var content))
            {
                return content.GetString() ?? string.Empty;
            }
        }

        return string.Empty;
    }
}
