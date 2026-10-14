namespace Application.Interfaces;

public interface IPasswordResetAuthorizationService
{
    (string RawToken, string TokenHash) GenerateAuthorizationToken();
    bool ValidateToken(string rawToken, string hash);
    string HashToken(string rawToken);
}