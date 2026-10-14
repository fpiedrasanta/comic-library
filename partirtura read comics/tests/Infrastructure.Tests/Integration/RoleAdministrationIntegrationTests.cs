using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Domain.Exceptions;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Hangfire;
using Hangfire.MySql;
using Xunit;

namespace Infrastructure.Tests.Integration;

[Collection("IntegrationTests")]
public class RoleAdministrationIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public RoleAdministrationIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateRole_ValidName_ReturnsCreatedRole()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var request = new CreateRoleRequest(uniqueName);

        var result = await roles.CreateRoleAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal(uniqueName, result.Name);
        Assert.True(result.IsActive);

        var stored = await unitOfWork.RoleRepository.GetByIdAsync(result.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(uniqueName, stored.Name);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task CreateRole_EmptyName_ThrowsValidationException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        await Assert.ThrowsAsync<ValidationException>(() => roles.CreateRoleAsync(new CreateRoleRequest(""), default));
        await Assert.ThrowsAsync<ValidationException>(() => roles.CreateRoleAsync(new CreateRoleRequest("   "), default));
    }

    [Fact]
    public async Task CreateRole_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default));
    }

    [Fact]
    public async Task GetPaged_ReturnsPaginatedRoles()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);

        var result = await roles.GetPagedAsync(new GetRolesRequest { currentPage = 1, pageSize = 10, search = uniqueName }, default);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Items);
        Assert.Contains(result.Items, r => r.Name == uniqueName);
    }

    [Fact]
    public async Task UpdateRole_ValidName_UpdatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);

        var newName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var updated = await roles.UpdateRoleAsync(created.Id, new UpdateRoleRequest { Name = newName }, default);

        Assert.NotNull(updated);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(newName, updated.Name);
        Assert.True(updated.IsActive);

        var stored = await unitOfWork.RoleRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(newName, stored.Name);
    }

    [Fact]
    public async Task UpdateRole_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => roles.UpdateRoleAsync(999999, new UpdateRoleRequest { Name = "Name" }, default));
    }

    [Fact]
    public async Task UpdateRole_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        var name1 = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var name2 = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var role1 = await roles.CreateRoleAsync(new CreateRoleRequest(name1), default);
        var role2 = await roles.CreateRoleAsync(new CreateRoleRequest(name2), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => roles.UpdateRoleAsync(role2.Id, new UpdateRoleRequest { Name = name1 }, default));
    }

    [Fact]
    public async Task DeactivateRole_ActiveRole_DeactivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);
        Assert.True(created.IsActive);

        await roles.DeactivateRoleAsync(created.Id, default);

        var stored = await unitOfWork.RoleRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.False(stored.IsActive);
    }

    [Fact]
    public async Task DeactivateRole_AlreadyInactive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);
        await roles.DeactivateRoleAsync(created.Id, default);
        var storedAfterFirst = await unitOfWork.RoleRepository.GetByIdAsync(created.Id, default);
        Assert.False(storedAfterFirst.IsActive);

        await roles.DeactivateRoleAsync(created.Id, default);

        var storedAfterSecond = await unitOfWork.RoleRepository.GetByIdAsync(created.Id, default);
        Assert.False(storedAfterSecond.IsActive);
    }

    [Fact]
    public async Task DeactivateRole_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => roles.DeactivateRoleAsync(999999, default));
    }

    [Fact]
    public async Task ActivateRole_InactiveRole_ActivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);
        await roles.DeactivateRoleAsync(created.Id, default);

        await roles.ActivateRoleAsync(created.Id, default);

        var stored = await unitOfWork.RoleRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivateRole_AlreadyActive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Role_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await roles.CreateRoleAsync(new CreateRoleRequest(uniqueName), default);

        await roles.ActivateRoleAsync(created.Id, default);

        var stored = await unitOfWork.RoleRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivateRole_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => roles.ActivateRoleAsync(999999, default));
    }
}