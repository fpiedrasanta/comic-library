using Serilog.Core;
using Serilog.Events;

namespace Api.Middleware;

public class SensitiveDataRedactionEnricher : ILogEventEnricher
{
    private static readonly string[] SensitivePropertyNames =
    {
        "Password",
        "password",
        "Code",
        "code",
        "Token",
        "token",
        "Authorization",
        "authorization",
        "RefreshToken",
        "refreshToken",
        "IdToken",
        "idToken",
        "SecretKey",
        "secretKey",
        "ApiKey",
        "apiKey",
        "EmailValidationToken",
        "PasswordResetToken",
        "EmailToken",
        "ValidationCode",
        "PasswordResetCode"
    };

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        foreach (var (key, value) in logEvent.Properties.ToList())
        {
            if (value is ScalarValue { Value: string stringValue } && IsSensitive(key))
            {
                logEvent.AddOrUpdateProperty(propertyFactory.CreateProperty(key, "***REDACTED***"));
            }
            else if (IsSensitive(key))
            {
                logEvent.AddOrUpdateProperty(propertyFactory.CreateProperty(key, "***REDACTED***"));
            }
        }
    }

    private static bool IsSensitive(string propertyName)
    {
        foreach (var sensitive in SensitivePropertyNames)
        {
            if (string.Equals(propertyName, sensitive, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }
        return false;
    }
}
