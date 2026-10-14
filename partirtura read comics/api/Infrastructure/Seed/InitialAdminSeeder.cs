using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Seed;

public class InitialAdminSeeder(
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork,
    IConfiguration configuration,
    ILogger<InitialAdminSeeder> logger) : IInitialAdminSeeder
{
    private const string AdminEmailKey = "Admin:InitialEmail";
    private const string AdminPasswordKey = "Admin:InitialPassword";

    private readonly IPasswordHasher _passwordHasher = passwordHasher;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IConfiguration _configuration = configuration;
    private readonly ILogger<InitialAdminSeeder> _logger = logger;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var email = _configuration[AdminEmailKey];
        var password = _configuration[AdminPasswordKey];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogError(
                "Initial administrator cannot be created: configuration '{EmailKey}' or '{PasswordKey}' is missing. " +
                "Provide the initial administrator email and a secure password through configuration (e.g. environment variables).",
                AdminEmailKey,
                AdminPasswordKey);
            return;
        }

        var existingAdmin = await _unitOfWork.UserRepository.GetByEmailAsync(email, cancellationToken);

        if (existingAdmin is null)
        {
            try
            {
                var admin = new User
                {
                    FirstName = "Administrator",
                    LastName = string.Empty,
                    Email = email,
                    PasswordHash = _passwordHasher.Hash(password),
                    Role = UserRole.Administrator,
                    IsEmailValidated = true,
                    EmailValidationToken = null,
                    EmailValidationTokenExpiresAt = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.UserRepository.AddAsync(admin, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Initial administrator created with email {Email}.", email);
            }
            catch (DbUpdateException)
            {
                existingAdmin = await _unitOfWork.UserRepository.GetByEmailAsync(email, cancellationToken);
            }
        }

        if (existingAdmin is not null && existingAdmin.Role != UserRole.Administrator)
        {
            existingAdmin.Role = UserRole.Administrator;
            await _unitOfWork.UserRepository.UpdateAsync(existingAdmin, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Role 'Administrator' assigned to user {Email}.", email);
        }
    }
}
