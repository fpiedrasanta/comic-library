using Application.Interfaces;
using Application.Services;
using Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class AIServiceCollectionExtensions
{
    public static IServiceCollection AddAIProviders(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AIProviderOptions>(configuration.GetSection(AIProviderOptions.SectionName));
        services.AddSingleton(sp =>
        {
            var options = new AIProviderOptions();
            configuration.GetSection(AIProviderOptions.SectionName).Bind(options);
            return options;
        });

        services.AddHttpClient<GeminiProvider>((sp, client) =>
        {
            var options = sp.GetRequiredService<AIProviderOptions>();
            if (!string.IsNullOrWhiteSpace(options.Gemini.Endpoint))
            {
                client.BaseAddress = new Uri(options.Gemini.Endpoint);
            }
            client.Timeout = TimeSpan.FromMinutes(2);
        });
        services.AddSingleton<IAIProvider>(sp => sp.GetRequiredService<GeminiProvider>());

        services.AddHttpClient<OpenRouterProvider>((sp, client) =>
        {
            var options = sp.GetRequiredService<AIProviderOptions>();
            if (!string.IsNullOrWhiteSpace(options.OpenRouter.Endpoint))
            {
                client.BaseAddress = new Uri(options.OpenRouter.Endpoint);
            }
            client.Timeout = TimeSpan.FromMinutes(2);
        });
        services.AddSingleton<IAIProvider>(sp => sp.GetRequiredService<OpenRouterProvider>());

        services.AddHttpClient<OllamaProvider>((sp, client) =>
        {
            var options = sp.GetRequiredService<AIProviderOptions>();
            if (!string.IsNullOrWhiteSpace(options.Ollama.Endpoint))
            {
                client.BaseAddress = new Uri(options.Ollama.Endpoint);
            }
            client.Timeout = TimeSpan.FromMinutes(5);
        });
        services.AddSingleton<IAIProvider>(sp => sp.GetRequiredService<OllamaProvider>());

        services.AddSingleton<IAIProviderResolver, AIProviderResolver>();
        services.AddScoped<IAIService, AIService>();

        return services;
    }
}
