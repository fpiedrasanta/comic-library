using Application.DTOs;

namespace Application.Interfaces;

public interface IGoogleAuthenticationService
{
    Task<GoogleUserInfo> ValidateAsync(string idToken, CancellationToken cancellationToken = default);
}
