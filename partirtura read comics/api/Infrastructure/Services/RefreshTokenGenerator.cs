using Application.Interfaces;
using System.Security.Cryptography;

namespace Infrastructure.Services;

public class RefreshTokenGenerator : IRefreshTokenGenerator
{
    public string GenerateSecureToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Base64UrlEncode(bytes);
    }

    private static string Base64UrlEncode(byte[] data)
    {
        return Convert.ToBase64String(data)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}