using System.Security.Cryptography;
using System.Text;
using Application.Interfaces;

namespace Infrastructure.Services;

public class AccountDeletionCodeService : IAccountDeletionCodeService
{
    public string GenerateCode()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }

    public string HashCode(string code)
    {
        var bytes = Encoding.UTF8.GetBytes(code);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }

    public bool VerifyCode(string rawCode, string storedHash)
    {
        var inputHash = HashCode(rawCode);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(inputHash),
            Encoding.UTF8.GetBytes(storedHash));
    }
}
