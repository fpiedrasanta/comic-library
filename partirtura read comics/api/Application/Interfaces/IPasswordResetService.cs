using Application.DTOs;

namespace Application.Interfaces;

public interface IPasswordResetService
{
    Task<RequestPasswordResetResponse> RequestResetAsync(RequestPasswordResetRequest request, CancellationToken cancellationToken = default);
    Task<ResendPasswordResetResponse> ResendResetAsync(ResendPasswordResetRequest request, CancellationToken cancellationToken = default);
    Task<ValidatePasswordResetResponse> ValidateResetAsync(ValidatePasswordResetRequest request, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default);
}