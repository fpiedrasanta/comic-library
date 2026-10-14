using Application.DTOs;
using Application.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class GoogleAuthenticationService(IConfiguration configuration) : IGoogleAuthenticationService
{
    private readonly IConfiguration _configuration = configuration;

    public async Task<GoogleUserInfo> ValidateAsync(string idToken, CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["Google:ClientId"] ?? string.Empty;

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { clientId }
        });

        var avatarUrl = payload.Picture;

        if (string.IsNullOrEmpty(avatarUrl))
        {
            avatarUrl = null;
        }

        return new GoogleUserInfo(
            Email: payload.Email,
            FirstName: payload.GivenName ?? string.Empty,
            LastName: payload.FamilyName ?? string.Empty,
            AvatarUrl: avatarUrl);
    }
}
