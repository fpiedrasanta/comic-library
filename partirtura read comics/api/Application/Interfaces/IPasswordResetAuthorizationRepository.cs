using Domain.Entities;

namespace Application.Interfaces;

public interface IPasswordResetAuthorizationRepository
{
    Task AddAsync(PasswordResetAuthorization authorization, CancellationToken cancellationToken = default);
    Task<PasswordResetAuthorization?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task UpdateAsync(PasswordResetAuthorization authorization, CancellationToken cancellationToken = default);
}