namespace Application.Configuration;

public static class RefreshTokenDefaults
{
    public const int ExpirationDays = 7;
    public const string CookieName = "comic_library_refresh_token";
    public const string ExpirationDaysKey = "RefreshToken:ExpirationDays";
}
