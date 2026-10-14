using Domain.Enums;

namespace Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(long userId, string email, string fullName, UserRole role);
}
