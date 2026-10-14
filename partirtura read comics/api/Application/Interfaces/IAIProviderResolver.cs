namespace Application.Interfaces;

public interface IAIProviderResolver
{
    IAIProvider ResolveProvider(string providerName);
}
