using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Settings;

public class AccountDeletionTokenSettingsProvider(IConfiguration configuration) : IAccountDeletionTokenSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;

    public int GetExpirationMinutes()
    {
        return _configuration.GetValue<int>("AccountDeletionMailContent:CodeExpirationMinutes");
    }
}
