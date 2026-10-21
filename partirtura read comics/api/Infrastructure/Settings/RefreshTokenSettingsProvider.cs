using Application.Configuration;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Settings;

public class RefreshTokenSettingsProvider(
    IConfiguration configuration,
    ILogger<RefreshTokenSettingsProvider> logger) : IRefreshTokenSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<RefreshTokenSettingsProvider> _logger = logger;

    public int GetExpirationDays()
    {
        var days = _configuration.GetValue<int?>(RefreshTokenDefaults.ExpirationDaysKey);

        if (days is null or <= 0)
        {
            _logger.LogWarning(
                "Configuration '{Key}' is missing or invalid. Using default of {Default} days for refresh tokens.",
                RefreshTokenDefaults.ExpirationDaysKey,
                RefreshTokenDefaults.ExpirationDays);

            return RefreshTokenDefaults.ExpirationDays;
        }

        return days.Value;
    }
}
