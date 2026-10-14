using Microsoft.Extensions.Options;

namespace Application.Configuration;

/// <summary>
/// Validates <see cref="JwtOptions"/> at startup (registered with
/// <c>ValidateOnStart()</c>) so the application fails fast with a clear
/// message when the JWT configuration is missing or invalid.
/// </summary>
public class JwtOptionsValidator : IValidateOptions<JwtOptions>
{
    private const int MinSecretKeyByteLength = 32; // HS256 minimum
    private const string PlaceholderSecretKey = "CHANGE_ME_SUPER_SECRET_KEY_AT_LEAST_32_CHARS";
    private const int MinExpirationMinutes = 1;
    private const int MaxExpirationMinutes = 1440;

    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        if (options is null)
        {
            return ValidateOptionsResult.Fail("JwtOptions must not be null.");
        }

        if (string.IsNullOrWhiteSpace(options.Issuer))
        {
            return ValidateOptionsResult.Fail("Jwt:Issuer must be specified.");
        }

        if (string.IsNullOrWhiteSpace(options.Audience))
        {
            return ValidateOptionsResult.Fail("Jwt:Audience must be specified.");
        }

        if (string.IsNullOrWhiteSpace(options.SecretKey))
        {
            return ValidateOptionsResult.Fail("Jwt:SecretKey must be specified.");
        }

        var secretKeyByteLength = System.Text.Encoding.UTF8.GetByteCount(options.SecretKey);
        if (secretKeyByteLength < MinSecretKeyByteLength)
        {
            return ValidateOptionsResult.Fail(
                $"Jwt:SecretKey must be at least {MinSecretKeyByteLength} bytes long for HS256. " +
                $"Current length: {secretKeyByteLength} bytes.");
        }

        if (options.SecretKey.Contains(PlaceholderSecretKey, StringComparison.OrdinalIgnoreCase))
        {
            return ValidateOptionsResult.Fail(
                "Jwt:SecretKey is set to the development placeholder value ('" + PlaceholderSecretKey + "'). " +
                "Replace it with a real secret key before running the application.");
        }

        if (options.ExpirationMinutes < MinExpirationMinutes || options.ExpirationMinutes > MaxExpirationMinutes)
        {
            return ValidateOptionsResult.Fail(
                $"Jwt:ExpirationMinutes must be between {MinExpirationMinutes} and {MaxExpirationMinutes} minutes. " +
                $"Current value: {options.ExpirationMinutes}.");
        }

        return ValidateOptionsResult.Success;
    }
}
