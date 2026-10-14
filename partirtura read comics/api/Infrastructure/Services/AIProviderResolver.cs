using Application.Interfaces;
using Application.Services;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

public class AIProviderResolver : IAIProviderResolver
{
    private readonly Dictionary<string, IAIProvider> _providers;

    public AIProviderResolver(IEnumerable<IAIProvider> providers)
    {
        _providers = providers.ToDictionary(p => p.ProviderName, StringComparer.OrdinalIgnoreCase);
    }

    public IAIProvider ResolveProvider(string providerName)
    {
        if (string.IsNullOrWhiteSpace(providerName))
        {
            throw new ArgumentException("Provider name cannot be null or empty.", nameof(providerName));
        }

        if (_providers.TryGetValue(providerName, out var provider))
        {
            return provider;
        }

        var available = string.Join(", ", _providers.Keys);
        throw new InvalidOperationException($"AI provider '{providerName}' is not registered. Available providers: {available}.");
    }
}
