using Application.DTOs;
using Application.Interfaces;
using Application.Mappers;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Enums;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Application.Services;

public class UserService : IUserService
{
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailTokenSettingsProvider _emailTokenSettings;
    private readonly IUnitOfWork _unitOfWork;
    
    public UserService(
        IPasswordHasher passwordHasher,
        IEmailService emailService,
        IFileStorageService fileStorageService,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailTokenSettingsProvider emailTokenSettings,
        IUnitOfWork unitOfWork)
    {
        _passwordHasher = passwordHasher;
        _emailService = emailService;
        _fileStorageService = fileStorageService;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailTokenSettings = emailTokenSettings;
        _unitOfWork = unitOfWork;
    }

    public async Task<RegisterUserResponse> RegisterAsync(RegisterUserApiRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser is not null)
        {
            if (existingUser.IsActive && existingUser.IsEmailValidated)
            {
                throw new BusinessConflictException("El email ya está registrado.");
            }

            if (!existingUser.IsEmailValidated && existingUser.EmailValidationTokenExpiresAt.HasValue
                && existingUser.EmailValidationTokenExpiresAt.Value > DateTime.UtcNow)
            {
                throw new BusinessConflictException("El email ya está siendo validado.");
            }

            if (existingUser.IsActive)
            {
                existingUser.IsActive = false;
                existingUser.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.UserRepository.UpdateAsync(existingUser, cancellationToken);
            }
        }

        Country? country = null;
        if (request.NationalityId.HasValue)
        {
            country = await _unitOfWork.CountryRepository.GetByIdAsync(request.NationalityId.Value, cancellationToken);
            if (country is null || !country.IsActive)
            {
                throw new BusinessNotFoundException("El país no existe.");
            }
        }

        Image? avatar = null;
        if (request.AvatarData is not null && request.AvatarFileName is not null)
        {
            avatar = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName, ImageType.Avatar, cancellationToken);
        }

        var passwordHash = _passwordHasher.Hash(request.Password);
        var emailValidationToken = GenerateValidationCode();
        var emailValidationTokenHash = HashValidationCode(emailValidationToken);
        var expiresInMinutes = _emailTokenSettings.GetExpirationMinutes();
        var emailValidationTokenExpiresAt = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Avatar = avatar,
            IsEmailValidated = false,
            EmailValidationToken = emailValidationTokenHash,
            EmailValidationTokenExpiresAt = emailValidationTokenExpiresAt,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Nationality = country
        };

        await _unitOfWork.UserRepository.AddAsync(user, cancellationToken);
        await _emailService.SendEmailValidationAsync(request.Email, emailValidationToken, expiresInMinutes, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RegisterUserResponse(user.Id, expiresInMinutes);
    }

    public async Task<ValidateEmailResponse> ValidateEmailAsync(ValidateEmailApiRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Code.Length != 6 || !request.Code.All(char.IsDigit))
        {
            throw new BusinessNotFoundException("Código de validación inválido.");
        }

        var codeHash = HashValidationCode(request.Code);
        var user = await _unitOfWork.UserRepository.GetByEmailAndValidationTokenHashAsync(request.Email, codeHash, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("Código de validación inválido.");
        }

        if (user.EmailValidationTokenExpiresAt is null || user.EmailValidationTokenExpiresAt < DateTime.UtcNow)
        {
            throw new BusinessNotFoundException("El código de validación ha vencido.");
        }

        user.EmailValidationToken = null;
        user.EmailValidationTokenExpiresAt = null;
        user.IsEmailValidated = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var fullName = $"{user.FirstName} {user.LastName}";
        var token = _jwtTokenGenerator.GenerateToken(user.Id, user.Email, fullName, user.Role);

        return new ValidateEmailResponse(token, new UserInfoDto(user.Id, user.Email, fullName), user.Role.ToString());
    }

    public async Task<ResendValidationEmailResponse> ResendValidationEmailAsync(ResendValidationEmailApiRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        int expirationMinutes = _emailTokenSettings.GetExpirationMinutes();

        var newCode = GenerateValidationCode();
        var newCodeHash = HashValidationCode(newCode);
        user.EmailValidationToken = newCodeHash;
        user.EmailValidationTokenExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
        user.IsEmailValidated = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _emailService.SendEmailValidationAsync(request.Email, newCode, expirationMinutes, cancellationToken);

        return new ResendValidationEmailResponse(expirationMinutes);
    }

    public async Task<UserProfileResponse> GetProfileAsync(long userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        string? avatarUrl = null;

        if (user.Avatar is not null)
        {
            avatarUrl = $"/images/{user.Avatar.Id}";
        }
        else if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
        {
            avatarUrl = user.AvatarUrl;
        }

        return new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            avatarUrl,
            user.Nationality?.Id,
            user.Nationality?.Name,
            user.Role.ToString());
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(long userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.UpdatedAt = DateTime.UtcNow;

        if (request.CountryId.HasValue)
        {
            var country = await _unitOfWork.CountryRepository.GetByIdAsync(request.CountryId.Value, cancellationToken);
            if (country is null || !country.IsActive)
            {
                throw new BusinessNotFoundException("El país no existe.");
            }

            user.Nationality = country;
        }
        else
        {
            user.Nationality = null;
        }

        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            var newAvatar = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "avatar.webp", ImageType.Avatar, cancellationToken);
            await _unitOfWork.ImageRepository.AddAsync(newAvatar, cancellationToken);
            user.Avatar = newAvatar;
            user.AvatarUrl = null;
        }
        else if (request.ImageId is null || request.ImageId == 0)
        {
            if (user.Avatar is not null)
            {
                user.Avatar = null;
                user.AvatarUrl = null;
            }
        }

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
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

        return new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            avatarUrl,
            user.Nationality?.Id,
            user.Nationality?.Name,
            user.Role.ToString());
    }

    private static string GenerateValidationCode()
    {
        return Random.Shared.Next(100000, 999999).ToString();
    }

    private static string HashValidationCode(string code)
    {
        var bytes = Encoding.UTF8.GetBytes(code);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
