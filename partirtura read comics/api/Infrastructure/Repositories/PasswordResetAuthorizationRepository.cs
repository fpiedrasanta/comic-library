using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class PasswordResetAuthorizationRepository(ApplicationDbContext context) : IPasswordResetAuthorizationRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task AddAsync(PasswordResetAuthorization authorization, CancellationToken cancellationToken = default)
    {
        _context.PasswordResetAuthorizations.Add(authorization);
    }

    public async Task<PasswordResetAuthorization?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.PasswordResetAuthorizations
            .FirstOrDefaultAsync(a => a.TokenHash == tokenHash, cancellationToken);
    }

    public async Task UpdateAsync(PasswordResetAuthorization authorization, CancellationToken cancellationToken = default)
    {
        _context.PasswordResetAuthorizations.Update(authorization);
    }
}