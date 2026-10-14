using Application.DTOs;

namespace Application.Interfaces;

public interface IAccountDeletionService
{
    Task<RequestAccountDeletionResponse> RequestAsync(long userId, CancellationToken cancellationToken = default);
    Task<ConfirmAccountDeletionResponse> ConfirmAsync(long userId, string code, CancellationToken cancellationToken = default);
}
