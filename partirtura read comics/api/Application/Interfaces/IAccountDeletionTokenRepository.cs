using Domain.Entities;

namespace Application.Interfaces;

public interface IAccountDeletionTokenRepository
{
    Task AddAsync(AccountDeletionToken token, CancellationToken cancellationToken = default);
    Task<AccountDeletionToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AccountDeletionToken>> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task UpdateAsync(AccountDeletionToken token, CancellationToken cancellationToken = default);
}
