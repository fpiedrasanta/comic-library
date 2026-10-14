using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Application.DTOs;
using Application.Exceptions;
using Application.Interfaces;
using Application.Services;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public abstract class HttpAIProviderBase : IAIProvider
{
    protected readonly HttpClient HttpClient;
    protected readonly AIProviderOptions Options;
    protected readonly ILogger Logger;

    protected HttpAIProviderBase(HttpClient httpClient, AIProviderOptions options, ILogger logger)
    {
        HttpClient = httpClient;
        Options = options;
        Logger = logger;
    }

    public abstract string ProviderName { get; }

    public async Task<AIResponse> CompleteAsync(AIRequest request, CancellationToken cancellationToken = default)
    {
        var model = Options.Model;
        var (endpoint, body) = BuildRequest(model, request);
        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        ApplyAuthHeader(httpRequest);

        using var response = await HttpClient.SendAsync(httpRequest, cancellationToken);
        var raw = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            Logger.LogError("AI provider {Provider} returned {StatusCode}: {Body}", ProviderName, (int)response.StatusCode, raw);
            throw new AIProviderException(ProviderName, $"AI provider {ProviderName} returned {(int)response.StatusCode} ({response.ReasonPhrase}): {raw}", statusCode: (int)response.StatusCode, responseBody: raw);
        }

        var content = ExtractContent(raw);
        return new AIResponse(content, ProviderName, model);
    }

    protected abstract (string Endpoint, string JsonBody) BuildRequest(string model, AIRequest request);

    protected abstract void ApplyAuthHeader(HttpRequestMessage request);

    protected abstract string ExtractContent(string responseJson);

    protected static string ToJson(object value)
    {
        return JsonSerializer.Serialize(value, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });
    }
}
