namespace Application.Interfaces;

public interface IRefreshTokenHasher
{
    string HashToken(string token);
}