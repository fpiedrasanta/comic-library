using Application.DTOs;

namespace Application.Interfaces;

public interface IRefreshTokenCookieSettingsProvider
{
    string GetCookieName();
    int GetExpirationDays();
    bool GetHttpOnly();
    bool GetSecure();
    string GetSameSite();
}