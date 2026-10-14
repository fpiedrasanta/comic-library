namespace Application.Interfaces;

public interface IRefreshTokenSettingsProvider
{
    int GetExpirationDays();
}