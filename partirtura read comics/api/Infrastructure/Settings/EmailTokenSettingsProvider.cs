using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Settings;

public class EmailTokenSettingsProvider(IConfiguration configuration) : IEmailTokenSettingsProvider
{
    private readonly IConfiguration _configuration = configuration;

    public int GetExpirationMinutes()
    {
        return _configuration.GetValue<int>("ValidationMailContent:TokenExpirationMinutes");
    }
}
