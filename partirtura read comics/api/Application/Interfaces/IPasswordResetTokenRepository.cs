using Domain.Entities;

namespace Application.Interfaces;

public interface IPasswordResetTokenRepository
{
    Task AddAsync(PasswordResetToken passwordResetToken, CancellationToken cancellationToken = default);
    Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PasswordResetToken>> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task UpdateAsync(PasswordResetToken passwordResetToken, CancellationToken cancellationToken = default);
}