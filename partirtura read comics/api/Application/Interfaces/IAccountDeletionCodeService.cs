namespace Application.Interfaces;

public interface IAccountDeletionCodeService
{
    string GenerateCode();
    string HashCode(string code);
    bool VerifyCode(string rawCode, string storedHash);
}
