using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Settings;

public class RefreshTokenCookieSettingsProvider(IConfiguration configuration) : IRefreshTokenCookieSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;

    public string GetCookieName()
    {
        return _configuration["Cookies:RefreshToken:Name"] ?? "comic_library_refresh_token";
    }

    public int GetExpirationDays()
    {
        return _configuration.GetValue<int>("RefreshToken:ExpirationDays");
    }

    public bool GetHttpOnly()
    {
        return _configuration.GetValue<bool>("Cookies:RefreshToken:HttpOnly");
    }

    public bool GetSecure()
    {
        return _configuration.GetValue<bool>("Cookies:RefreshToken:Secure");
    }

    public string GetSameSite()
    {
        return _configuration["Cookies:RefreshToken:SameSite"] ?? "Lax";
    }
}