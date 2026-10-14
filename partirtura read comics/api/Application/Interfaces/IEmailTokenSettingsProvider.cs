namespace Application.Interfaces;

public interface IEmailTokenSettingsProvider
{
    int GetExpirationMinutes();
}
