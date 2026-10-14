using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using System.Collections.Generic;

namespace Application.Services;

public class AccountDeletionService(
    IAccountDeletionCodeService accountDeletionCodeService,
    IEmailService emailService,
    IUnitOfWork unitOfWork,
    IAccountDeletionTokenSettingsProvider accountDeletionTokenSettings) : IAccountDeletionService
{
    private readonly IAccountDeletionCodeService _accountDeletionCodeService = accountDeletionCodeService;
    private readonly IEmailService _emailService = emailService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IAccountDeletionTokenSettingsProvider _accountDeletionTokenSettings = accountDeletionTokenSettings;

    public async Task<RequestAccountDeletionResponse> RequestAsync(long userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        var activeTokens = await _unitOfWork.AccountDeletionTokenRepository.GetActiveByUserIdAsync(user.Id, cancellationToken);

        foreach (var token in activeTokens)
        {
            token.UsedAt = DateTime.UtcNow;
            await _unitOfWork.AccountDeletionTokenRepository.UpdateAsync(token, cancellationToken);
        }

        var code = _accountDeletionCodeService.GenerateCode();
        var codeHash = _accountDeletionCodeService.HashCode(code);
        var expiresInMinutes = _accountDeletionTokenSettings.GetExpirationMinutes();
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var deletionToken = new AccountDeletionToken
        {
            User = user,
            TokenHash = codeHash,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            UsedAt = null
        };

        await _unitOfWork.AccountDeletionTokenRepository.AddAsync(deletionToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailService.SendAccountDeletionCodeAsync(user.Email, code, expiresInMinutes, cancellationToken);

        return new RequestAccountDeletionResponse { ExpiresInMinutes = expiresInMinutes };
    }

    public async Task<ConfirmAccountDeletionResponse> ConfirmAsync(long userId, string code, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        var codeHash = _accountDeletionCodeService.HashCode(code);
        var deletionToken = await _unitOfWork.AccountDeletionTokenRepository.GetByTokenHashAsync(codeHash, cancellationToken);

        if (deletionToken is null || deletionToken.User != user)
        {
            throw new BusinessConflictException("El código de eliminación es inválido.");
        }

        if (deletionToken.UsedAt is not null || deletionToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new BusinessConflictException("El código de eliminación ha vencido.");
        }

        if (!_accountDeletionCodeService.VerifyCode(code, deletionToken.TokenHash))
        {
            throw new BusinessConflictException("El código de eliminación es inválido.");
        }

        deletionToken.UsedAt = DateTime.UtcNow;
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.AccountDeletionTokenRepository.UpdateAsync(deletionToken, cancellationToken);

        var activeTokens = await _unitOfWork.RefreshTokenRepository.GetActiveByUserIdAsync(user.Id, cancellationToken);
        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.IsUsed = true;
            await _unitOfWork.RefreshTokenRepository.UpdateAsync(token, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ConfirmAccountDeletionResponse { Message = "Cuenta eliminada correctamente." };
    }
}
