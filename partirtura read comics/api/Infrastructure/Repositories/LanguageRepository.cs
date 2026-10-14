using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class LanguageRepository(ApplicationDbContext context) : ILanguageRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Language?> GetByIdAsync(long languageId, CancellationToken cancellationToken = default)
    {
        return await _context.Languages
            .FirstOrDefaultAsync(l => l.Id == languageId, cancellationToken);
    }

    public async Task<IReadOnlyList<Language>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Languages
            .AsNoTracking()
            .OrderBy(l => l.Name)
            .ToListAsync(cancellationToken);
    }
}
