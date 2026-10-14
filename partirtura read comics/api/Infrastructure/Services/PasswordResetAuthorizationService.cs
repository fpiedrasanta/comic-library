using Application.Interfaces;
using System.Security.Cryptography;

namespace Infrastructure.Services;

public class PasswordResetAuthorizationService : IPasswordResetAuthorizationService
{
    public (string RawToken, string TokenHash) GenerateAuthorizationToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        var rawToken = Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

        var hash = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
        var tokenHash = Convert.ToBase64String(hash);

        return (rawToken, tokenHash);
    }

    public bool ValidateToken(string rawToken, string hash)
    {
        var computedHash = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
        return CryptographicOperations.FixedTimeEquals(computedHash, Convert.FromBase64String(hash));
    }

    public string HashToken(string rawToken)
    {
        var hash = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToBase64String(hash);
    }
}