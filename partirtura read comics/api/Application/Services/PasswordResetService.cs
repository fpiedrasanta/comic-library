using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;

namespace Application.Services;

public class PasswordResetService(
    IPasswordResetCodeService passwordResetCodeService,
    IEmailService emailService,
    IUnitOfWork unitOfWork,
    IPasswordResetAuthorizationService passwordResetAuthorizationService,
    IPasswordHasher passwordHasher,
    IPasswordValidator passwordValidator) : IPasswordResetService
{
    private readonly IPasswordResetCodeService _passwordResetCodeService = passwordResetCodeService;
    private readonly IEmailService _emailService = emailService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IPasswordResetAuthorizationService _passwordResetAuthorizationService = passwordResetAuthorizationService;
    private readonly IPasswordHasher _passwordHasher = passwordHasher;
    private readonly IPasswordValidator _passwordValidator = passwordValidator;

    public async Task<RequestPasswordResetResponse> RequestResetAsync(RequestPasswordResetRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !user.IsActive || !user.IsEmailValidated)
        {
            throw new InvalidCredentialsException("Credenciales incorrectas.");
        }

        await InvalidatePreviousTokensAsync(user.Id, cancellationToken);

        var code = _passwordResetCodeService.GenerateCode();
        var codeHash = _passwordResetCodeService.HashCode(code);
        var expiresInMinutes = _passwordResetCodeService.GetExpirationMinutes();
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var passwordResetToken = new PasswordResetToken
        {
            User = user,
            TokenHash = codeHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            UsedAt = null
        };

        await _unitOfWork.PasswordResetTokenRepository.AddAsync(passwordResetToken, cancellationToken);

        await _emailService.SendPasswordResetEmailAsync(user.Email, code, expiresInMinutes, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RequestPasswordResetResponse(expiresInMinutes);
    }

    public async Task<ResendPasswordResetResponse> ResendResetAsync(ResendPasswordResetRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !user.IsActive || !user.IsEmailValidated)
        {
            throw new InvalidCredentialsException("Credenciales incorrectas.");
        }

        await InvalidatePreviousTokensAsync(user.Id, cancellationToken);

        var code = _passwordResetCodeService.GenerateCode();
        var codeHash = _passwordResetCodeService.HashCode(code);
        var expiresInMinutes = _passwordResetCodeService.GetExpirationMinutes();
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var passwordResetToken = new PasswordResetToken
        {
            User = user,
            TokenHash = codeHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            UsedAt = null
        };

        await _unitOfWork.PasswordResetTokenRepository.AddAsync(passwordResetToken, cancellationToken);

        await _emailService.SendPasswordResetEmailAsync(user.Email, code, expiresInMinutes, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ResendPasswordResetResponse(expiresInMinutes);
    }

    public async Task<ValidatePasswordResetResponse> ValidateResetAsync(ValidatePasswordResetRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !user.IsActive || !user.IsEmailValidated)
        {
            throw new InvalidCredentialsException("Código de recuperación inválido o vencido.");
        }

        var codeHash = _passwordResetCodeService.HashCode(request.Code);
        var token = await _unitOfWork.PasswordResetTokenRepository.GetByTokenHashAsync(codeHash, cancellationToken);

        if (token is null || token.User.Id != user.Id || token.UsedAt is not null || token.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidCredentialsException("Código de recuperación inválido o vencido.");
        }

        token.UsedAt = DateTime.UtcNow;
        await _unitOfWork.PasswordResetTokenRepository.UpdateAsync(token, cancellationToken);

        var (rawAuthorization, authorizationHash) = _passwordResetAuthorizationService.GenerateAuthorizationToken();
        var authorization = new PasswordResetAuthorization
        {
            User = user,
            TokenHash = authorizationHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            UsedAt = null
        };

        await _unitOfWork.PasswordResetAuthorizationRepository.AddAsync(authorization, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ValidatePasswordResetResponse(rawAuthorization);
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !user.IsActive || !user.IsEmailValidated)
        {
            throw new InvalidCredentialsException("Token de autorización inválido o vencido.");
        }

        if (!_passwordValidator.IsValid(request.NewPassword, out var validationError))
        {
            throw new ValidationException(validationError);
        }

        var authorizationHash = _passwordResetAuthorizationService.HashToken(request.AuthorizationToken);
        var authorization = await _unitOfWork.PasswordResetAuthorizationRepository.GetByTokenHashAsync(authorizationHash, cancellationToken);

        if (authorization is null || authorization.User.Id != user.Id || authorization.UsedAt is not null || authorization.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidCredentialsException("Token de autorización inválido o vencido.");
        }

        authorization.UsedAt = DateTime.UtcNow;
        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.PasswordResetAuthorizationRepository.UpdateAsync(authorization, cancellationToken);

        var activeRefreshTokens = await _unitOfWork.RefreshTokenRepository.GetActiveByUserIdAsync(user.Id, cancellationToken);

        foreach (var token in activeRefreshTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            await _unitOfWork.RefreshTokenRepository.UpdateAsync(token, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task InvalidatePreviousTokensAsync(long userId, CancellationToken cancellationToken)
    {
        var activeTokens = await _unitOfWork.PasswordResetTokenRepository.GetActiveByUserIdAsync(userId, cancellationToken);

        foreach (var token in activeTokens)
        {
            token.UsedAt = DateTime.UtcNow;
            await _unitOfWork.PasswordResetTokenRepository.UpdateAsync(token, cancellationToken);
        }
    }
}