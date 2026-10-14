using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;

namespace Infrastructure.Services;

public class PasswordResetCodeService(IConfiguration configuration) : IPasswordResetCodeService
{
    private readonly IConfiguration _configuration = configuration;

    public string GenerateCode()
    {
        var bytes = new byte[4];
        RandomNumberGenerator.Fill(bytes);
        var number = BitConverter.ToUInt32(bytes) % 1000000;
        return number.ToString("D6");
    }

    public string HashCode(string code)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(code));
        return Convert.ToBase64String(bytes);
    }

    public bool ValidateCode(string rawCode, string hash)
    {
        var hashed = HashCode(rawCode);
        return CryptographicOperations.FixedTimeEquals(
            System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawCode)),
            Convert.FromBase64String(hash));
    }

    public int GetExpirationMinutes()
    {
        return _configuration.GetValue<int>("PasswordResetMailContent:CodeExpirationMinutes");
    }
}