using Application.Configuration;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Settings;

public class RefreshTokenCookieSettingsProvider(
    IConfiguration configuration,
    ILogger<RefreshTokenCookieSettingsProvider> logger) : IRefreshTokenCookieSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<RefreshTokenCookieSettingsProvider> _logger = logger;

    public string GetCookieName()
    {
        return _configuration["Cookies:RefreshToken:Name"] ?? RefreshTokenDefaults.CookieName;
    }

    public int GetExpirationDays()
    {
        var days = _configuration.GetValue<int?>(RefreshTokenDefaults.ExpirationDaysKey);

        if (days is null or <= 0)
        {
            _logger.LogWarning(
                "Configuration '{Key}' is missing or invalid. Using default of {Default} days for the refresh token cookie.",
                RefreshTokenDefaults.ExpirationDaysKey,
                RefreshTokenDefaults.ExpirationDays);

            return RefreshTokenDefaults.ExpirationDays;
        }

        return days.Value;
    }

    public bool GetHttpOnly()
    {
        return _configuration.GetValue<bool?>("Cookies:RefreshToken:HttpOnly") ?? true;
    }

    public bool GetSecure()
    {
        return _configuration.GetValue<bool?>("Cookies:RefreshToken:Secure") ?? false;
    }

    public string GetSameSite()
    {
        return _configuration["Cookies:RefreshToken:SameSite"] ?? "Lax";
    }
}
