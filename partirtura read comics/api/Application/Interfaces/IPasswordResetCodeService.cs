namespace Application.Interfaces;

public interface IPasswordResetCodeService
{
    string GenerateCode();
    string HashCode(string code);
    bool ValidateCode(string rawCode, string hash);
    int GetExpirationMinutes();
}