using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class AccountDeletionTokenRepository(ApplicationDbContext context) : IAccountDeletionTokenRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task AddAsync(AccountDeletionToken token, CancellationToken cancellationToken = default)
    {
        _context.AccountDeletionTokens.Add(token);
    }

    public async Task<AccountDeletionToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.AccountDeletionTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);
    }

    public async Task<IReadOnlyList<AccountDeletionToken>> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await _context.AccountDeletionTokens
            .Where(t => t.User.Id == userId && t.UsedAt == null && t.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(AccountDeletionToken token, CancellationToken cancellationToken = default)
    {
        _context.AccountDeletionTokens.Update(token);
    }
}
