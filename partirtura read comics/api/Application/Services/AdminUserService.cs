using Application.Constants;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPasswordValidator _passwordValidator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;

    public AdminUserService(
        IPasswordHasher passwordHasher, 
        IPasswordValidator passwordValidator, 
        IUnitOfWork unitOfWork, 
        IFileStorageService fileStorageService)
    {
        _passwordHasher = passwordHasher;
        _passwordValidator = passwordValidator;
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
    }

    public async Task<ListResponse<AdminUserListItemDto>> GetPagedAsync(GetAdminUsersRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 12;
        if (request.pageSize > 50) request.pageSize = 50;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.ASC;

        (IReadOnlyList<User> items, int totalCount) = await _unitOfWork.UserRepository.GetAdminUsersPagedAsync(request, cancellationToken);



        List<AdminUserListItemDto> users = new List<AdminUserListItemDto>();
        
        foreach(User item in items)
        {
            users.Add(new AdminUserListItemDto(
                item.Id, 
                item.FirstName, 
                item.LastName, 
                item.Email, 
                item.AvatarUrl, 
                item.GetCountryName(), 
                item.CreatedAt, 
                item.IsActive));
        }
        
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.pageSize);

        return new ListResponse<AdminUserListItemDto>(
            request.currentPage,
            request.currentPage < totalPages,
            request.currentPage > 1,
            totalPages,
            request.pageSize,
            request.currentPage < totalPages ? request.currentPage + 1 : null,
            request.currentPage > 1 ? request.currentPage - 1 : null,
            totalCount,
            users);
    }

    public async Task<AdminUserDetailDto> GetByIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("El usuario es obligatorio.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        if (user.Role != UserRole.Administrator)
        {
            throw new BusinessNotFoundException("El usuario no es un administrador.");
        }

        var avatarUrl = user.Avatar != null ? $"/images/{user.Avatar.Id}" : user.AvatarUrl;
        var countryName = user.Nationality != null ? user.Nationality.Name : null;

        return new AdminUserDetailDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Nationality != null ? user.Nationality.Id : 0,
            countryName,
            avatarUrl,
            user.IsActive);
    }

    public async Task<long> CreateAdminUserAsync(CreateAdminUserRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            throw new ValidationException("El apellido es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ValidationException("El email es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ValidationException("La contraseña es obligatoria.");
        }

        var passwordValidation = _passwordValidator.IsValid(request.Password, out var passwordError);
        if (!passwordValidation)
        {
            throw new ValidationException(passwordError);
        }

        Country? country = null;
        if (request.CountryId.HasValue)
        {
            country = await _unitOfWork.CountryRepository.GetByIdAsync(request.CountryId.Value, cancellationToken);
            if (country is null || !country.IsActive)
            {
                throw new BusinessNotFoundException("El país no existe o no está activo.");
            }
        }

        var existingUser = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingUser is not null)
        {
            throw new BusinessConflictException("El email ya está registrado.");
        }

        Image? avatar = null;
        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            avatar = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "avatar.webp", ImageType.Avatar, cancellationToken);
            await _unitOfWork.ImageRepository.AddAsync(avatar, cancellationToken);
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Nationality = country,
            Role = UserRole.Administrator,
            IsEmailValidated = true,
            EmailValidationToken = null,
            EmailValidationTokenExpiresAt = null,
            Avatar = avatar,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };

        try
        {
            await _unitOfWork.UserRepository.AddAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            if (avatar is not null)
            {
                await _fileStorageService.DeleteAsync(avatar.StoragePath, cancellationToken);
            }
            throw;
        }

        return user.Id;
    }

    public async Task UpdateAdminUserAsync(long userId, UpdateAdminUserRequest request, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("El usuario es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            throw new ValidationException("El apellido es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ValidationException("El email es obligatorio.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        if (user.Role != UserRole.Administrator)
        {
            throw new BusinessNotFoundException("El usuario no es un administrador.");
        }

        Country? country = null;
        if (request.CountryId.HasValue)
        {
            country = await _unitOfWork.CountryRepository.GetByIdAsync(request.CountryId.Value, cancellationToken);
            if (country is null || !country.IsActive)
            {
                throw new BusinessNotFoundException("El país no existe o no está activo.");
            }
        }

        var emailInUse = await _unitOfWork.UserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (emailInUse is not null && emailInUse.Id != userId)
        {
            throw new BusinessConflictException("El email ya está registrado.");
        }

        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            await UpdateUserAvatarAsync(user, request.AvatarData, request.AvatarFileName, cancellationToken);
        }
        else if (request.ImageId is null || request.ImageId == 0)
        {
            if (user.Avatar is not null)
            {
                var oldImagePath = user.Avatar.StoragePath;
                user.Avatar = null;
                
                await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                await _fileStorageService.DeleteAsync(oldImagePath, cancellationToken);
            }
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Email = request.Email.Trim();
        user.Nationality = country;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateUserAvatarAsync(User user, byte[] avatarData, string? avatarFileName, CancellationToken cancellationToken)
    {
        var oldImagePath = user.Avatar?.StoragePath;
        var newImage = await _fileStorageService.SaveAsync(avatarData, avatarFileName ?? "avatar.webp", ImageType.Avatar, cancellationToken);

        try
        {
            await _unitOfWork.ImageRepository.AddAsync(newImage, cancellationToken);
            user.Avatar = newImage;
            
            await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            if (!string.IsNullOrEmpty(oldImagePath))
            {
                await _fileStorageService.DeleteAsync(oldImagePath, cancellationToken);
            }
        }
        catch
        {
            await _fileStorageService.DeleteAsync(newImage.StoragePath, cancellationToken);
            throw;
        }
    }

    public async Task DeactivateAdminUserAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("El usuario es obligatorio.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        if (user.Role != UserRole.Administrator)
        {
            throw new BusinessNotFoundException("El usuario no es un administrador.");
        }

        if (!user.IsActive)
        {
            return;
        }

        var activeAdminsCount = await _unitOfWork.UserRepository.GetActiveAdminUsersCountAsync(cancellationToken);

        var isLastActiveAdmin = activeAdminsCount <= 1;

        if (isLastActiveAdmin)
        {
            throw new BusinessConflictException("No se puede desactivar el último administrador activo.");
        }

        user.IsActive = false;
        
        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateAdminUserAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("El usuario es obligatorio.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            throw new BusinessNotFoundException("El usuario no existe.");
        }

        if (user.Role != UserRole.Administrator)
        {
            throw new BusinessNotFoundException("El usuario no es un administrador.");
        }

        if (user.IsActive)
        {
            return;
        }

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
