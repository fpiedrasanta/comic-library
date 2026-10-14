using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class PasswordResetTokenRepository(ApplicationDbContext context) : IPasswordResetTokenRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task AddAsync(PasswordResetToken passwordResetToken, CancellationToken cancellationToken = default)
    {
        _context.PasswordResetTokens.Add(passwordResetToken);
    }

    public async Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);
    }

    public async Task<IReadOnlyList<PasswordResetToken>> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await _context.PasswordResetTokens
            .Include(t => t.User)
            .Where(t => t.User.Id == userId
                      && t.UsedAt == null
                      && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(PasswordResetToken passwordResetToken, CancellationToken cancellationToken = default)
    {
        _context.PasswordResetTokens.Update(passwordResetToken);
    }
}