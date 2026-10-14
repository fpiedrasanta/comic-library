using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class AuthService(
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IRefreshTokenGenerator refreshTokenGenerator,
    IRefreshTokenHasher refreshTokenHasher,
    IUnitOfWork unitOfWork,
    IRefreshTokenSettingsProvider refreshTokenSettings,
    IGoogleAuthenticationService googleAuthenticationService,
    ILogger<AuthService> logger) : IAuthService
{
    private readonly IPasswordHasher _passwordHasher = passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator = jwtTokenGenerator;
    private readonly IRefreshTokenGenerator _refreshTokenGenerator = refreshTokenGenerator;
    private readonly IRefreshTokenHasher _refreshTokenHasher = refreshTokenHasher;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IRefreshTokenSettingsProvider _refreshTokenSettings = refreshTokenSettings;
    private readonly IGoogleAuthenticationService _googleAuthenticationService = googleAuthenticationService;
    private readonly ILogger<AuthService> _logger = logger;

    public async Task<AuthResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(email, cancellationToken);

        if (user is null || !_passwordHasher.Verify(password, user.PasswordHash) || !user.IsActive)
        {
            _logger.LogWarning("Login failed for email {Email}", email);
            throw new InvalidCredentialsException("Credenciales incorrectas.");
        }

        if (!user.IsEmailValidated)
        {
            _logger.LogWarning("Login blocked: email not validated for {Email}", email);
            throw new InvalidCredentialsException("Credenciales incorrectas.");
        }

        await ValidateUserNotBannedAsync(user.Id, cancellationToken);

        _logger.LogInformation("Login successful for {Email}", email);
        return await GenerateAuthResultAsync(user, cancellationToken);
    }

    public async Task<AuthResult> LoginWithGoogleAsync(string idToken, CancellationToken cancellationToken = default)
    {
        GoogleUserInfo googleUserInfo;

        try
        {
            googleUserInfo = await _googleAuthenticationService.ValidateAsync(idToken, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Google token validation failed");
            throw new InvalidCredentialsException("Credenciales incorrectas.");
        }

        var user = await _unitOfWork.UserRepository.GetByEmailAsync(googleUserInfo.Email, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                FirstName = googleUserInfo.FirstName,
                LastName = googleUserInfo.LastName,
                Email = googleUserInfo.Email,
                PasswordHash = string.Empty,
                Nationality = null,
                Avatar = null,
                AvatarUrl = googleUserInfo.AvatarUrl,
                IsEmailValidated = true,
                EmailValidationToken = null,
                EmailValidationTokenExpiresAt = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _unitOfWork.UserRepository.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            if (!user.IsActive)
            {
                throw new InvalidCredentialsException("Credenciales incorrectas.");
            }

            if (!user.IsEmailValidated)
            {
                user.IsEmailValidated = true;
                user.EmailValidationToken = null;
                user.EmailValidationTokenExpiresAt = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        await ValidateUserNotBannedAsync(user.Id, cancellationToken);

        return await GenerateAuthResultAsync(user, cancellationToken);
    }

    private async Task ValidateUserNotBannedAsync(long userId, CancellationToken cancellationToken = default)
    {
        var activeBans = await _unitOfWork.BanRepository.GetActiveByUserIdAsync(userId, cancellationToken);
        if (activeBans.Count > 0)
        {
            var reason = activeBans[0].Reason;
            throw new InvalidCredentialsException($"La cuenta se encuentra suspendida: {reason}");
        }
    }

    public async Task<AuthResult> RefreshTokenAsync(string rawToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _refreshTokenHasher.HashToken(rawToken);
        var oldToken = await _unitOfWork.RefreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (oldToken is null || oldToken.User == null || oldToken.RevokedAt is not null || oldToken.IsUsed || oldToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidCredentialsException("Token de actualización inválido.");
        }

        var userId = oldToken.User.Id;

        oldToken.RevokedAt = DateTime.UtcNow;
        oldToken.IsUsed = true;

        var refreshTokenExpirationDays = _refreshTokenSettings.GetExpirationDays();
        var newExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);

        var newRawToken = _refreshTokenGenerator.GenerateSecureToken();
        var newTokenHash = _refreshTokenHasher.HashToken(newRawToken);

        var newRefreshToken = new RefreshToken
        {
            User = oldToken.User,
            TokenHash = newTokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = newExpiresAt,
            RevokedAt = null,
            IsUsed = false
        };

        await _unitOfWork.RefreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new InvalidCredentialsException("Token de actualización inválido.");
        }

        await ValidateUserNotBannedAsync(user.Id, cancellationToken);

        return await GenerateAuthResultAsync(user, cancellationToken);
    }

    public async Task LogoutAsync(string rawToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _refreshTokenHasher.HashToken(rawToken);
        var refreshToken = await _unitOfWork.RefreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (refreshToken is null)
        {
            return;
        }

        if (refreshToken.User.Id == 0 || refreshToken.RevokedAt is not null || refreshToken.IsUsed || refreshToken.ExpiresAt < DateTime.UtcNow)
        {
            return;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.IsUsed = true;

        await _unitOfWork.RefreshTokenRepository.UpdateAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task LogoutAllAsync(string rawToken, CancellationToken cancellationToken = default)
    {
        var tokenHash = _refreshTokenHasher.HashToken(rawToken);
        var refreshToken = await _unitOfWork.RefreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (refreshToken is null || refreshToken.User.Id == 0)
        {
            return;
        }

        var activeTokens = await _unitOfWork.RefreshTokenRepository.GetActiveByUserIdAsync(refreshToken.User.Id, cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.IsUsed = true;
            await _unitOfWork.RefreshTokenRepository.UpdateAsync(token, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<AuthResult> GenerateAuthResultAsync(User user, CancellationToken cancellationToken = default)
    {
        var accessToken = _jwtTokenGenerator.GenerateToken(user.Id, user.Email, $"{user.FirstName} {user.LastName}", user.Role);

        var refreshTokenExpirationDays = _refreshTokenSettings.GetExpirationDays();
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpirationDays);

        var rawRefreshToken = _refreshTokenGenerator.GenerateSecureToken();
        var refreshTokenHash = _refreshTokenHasher.HashToken(rawRefreshToken);

        var refreshToken = new RefreshToken
        {
            User = user,
            TokenHash = refreshTokenHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = refreshTokenExpiresAt,
            RevokedAt = null,
            IsUsed = false
        };

        await _unitOfWork.RefreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        string? avatarUrl = null;

        if (user.Avatar is not null)
        {
            avatarUrl = $"/images/{user.Avatar.Id}";
        }
        else if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
        {
            avatarUrl = user.AvatarUrl;
        }

        var authResponse = new AuthResponse(
            AccessToken: accessToken,
            UserId: user.Id,
            Email: user.Email,
            FullName: $"{user.FirstName} {user.LastName}",
            Role: user.Role.ToString(),
            AvatarUrl: avatarUrl);

        return new AuthResult(authResponse, rawRefreshToken);
    }
}
