using Domain.Entities;

namespace Application.Interfaces;

public interface ILanguageRepository
{
    Task<Language?> GetByIdAsync(long languageId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Language>> GetAllAsync(CancellationToken cancellationToken = default);
}
