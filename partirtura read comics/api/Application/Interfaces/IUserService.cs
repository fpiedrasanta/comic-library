using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IUserService
{
    Task<RegisterUserResponse> RegisterAsync(RegisterUserApiRequest request, CancellationToken cancellationToken = default);
    Task<ValidateEmailResponse> ValidateEmailAsync(ValidateEmailApiRequest request, CancellationToken cancellationToken = default);
    Task<ResendValidationEmailResponse> ResendValidationEmailAsync(ResendValidationEmailApiRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileResponse> GetProfileAsync(long userId, CancellationToken cancellationToken = default);
    Task<UserProfileResponse> UpdateProfileAsync(long userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
}
