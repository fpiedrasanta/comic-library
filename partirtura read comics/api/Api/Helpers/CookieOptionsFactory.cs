using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Api.Helpers;

public static class CookieOptionsFactory
{
    public static CookieOptions Create(IRefreshTokenCookieSettingsProvider settings)
    {
        return new CookieOptions
        {
            HttpOnly = settings.GetHttpOnly(),
            Secure = settings.GetSecure(),
            SameSite = ParseSameSite(settings.GetSameSite()),
            Path = "/"
        };
    }

    public static CookieOptions CreateDelete(IRefreshTokenCookieSettingsProvider settings)
    {
        return new CookieOptions
        {
            HttpOnly = settings.GetHttpOnly(),
            Secure = settings.GetSecure(),
            SameSite = ParseSameSite(settings.GetSameSite()),
            Path = "/",
            MaxAge = TimeSpan.Zero,
            Expires = DateTimeOffset.UnixEpoch
        };
    }

    private static SameSiteMode ParseSameSite(string? value) => value?.ToLowerInvariant() switch
    {
        "strict" => SameSiteMode.Strict,
        "none" => SameSiteMode.None,
        _ => SameSiteMode.Lax
    };
}
