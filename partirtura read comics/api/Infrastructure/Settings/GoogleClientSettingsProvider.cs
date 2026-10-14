using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Settings;

public class GoogleClientSettingsProvider(IConfiguration configuration) : IGoogleClientSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;

    public string GetClientId()
    {
        var clientId = _configuration["Google:ClientId"];

        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new BusinessNotFoundException("Google Client ID is not configured.");
        }

        return clientId;
    }
}
