using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Settings;

public class RefreshTokenSettingsProvider(IConfiguration configuration) : IRefreshTokenSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;

    public int GetExpirationDays()
    {
        return _configuration.GetValue<int>("RefreshToken:ExpirationDays");
    }
}