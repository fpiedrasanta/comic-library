using System.Text.Json;
using System.Text.Json.Serialization;
using Application.DTOs;
using Application.Services;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class GeminiProvider : HttpAIProviderBase
{
    public GeminiProvider(HttpClient httpClient, AIProviderOptions options, ILogger<GeminiProvider> logger)
        : base(httpClient, options, logger)
    {
    }

    public override string ProviderName => "Gemini";

    protected override (string Endpoint, string JsonBody) BuildRequest(string model, AIRequest request)
    {
        var endpoint = $"/v1beta/models/{model}:generateContent";

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
            contents = new[]
            {
                new { parts = parts }
            }
        };

        return (endpoint, ToJson(payload));
    }

        protected override void ApplyAuthHeader(HttpRequestMessage request)
        {
            var key = Options.Gemini.ApiKey;
            if (string.IsNullOrWhiteSpace(key)) return;

            var endpoint = Options.Gemini.Endpoint?.TrimEnd('/') ?? string.Empty;
            var path = request.RequestUri?.ToString() ?? string.Empty;

            if (!path.StartsWith("/"))
            {
                path = "/" + path;
            }

            request.RequestUri = new Uri($"{endpoint}{path}?key={key}", UriKind.Absolute);
        }

    protected override string ExtractContent(string responseJson)
    {
        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var first = candidates[0];
            if (first.TryGetProperty("content", out var content) &&
                content.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0)
            {
                var builder = new System.Text.StringBuilder();
                foreach (var part in parts.EnumerateArray())
                {
                    if (part.TryGetProperty("text", out var text))
                    {
                        builder.Append(text.GetString());
                    }
                }
                return builder.ToString();
            }
        }

        return string.Empty;
    }
}
