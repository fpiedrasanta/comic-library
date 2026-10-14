namespace Application.Interfaces;

public interface IRefreshTokenGenerator
{
    string GenerateSecureToken();
}