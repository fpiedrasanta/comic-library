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
public class ListTypeAdministrationIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public ListTypeAdministrationIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateListType_ValidName_ReturnsCreatedListType()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var request = new CreateListTypeRequest(uniqueName);

        var result = await listTypes.CreateAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal(uniqueName, result.Name);
        Assert.True(result.IsActive);

        var stored = await unitOfWork.ListTypeRepository.GetByIdAsync(result.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(uniqueName, stored.Name);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task CreateListType_EmptyName_ThrowsValidationException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        await Assert.ThrowsAsync<ValidationException>(() => listTypes.CreateAsync(new CreateListTypeRequest(""), default));
        await Assert.ThrowsAsync<ValidationException>(() => listTypes.CreateAsync(new CreateListTypeRequest("   "), default));
    }

    [Fact]
    public async Task CreateListType_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default));
    }

    [Fact]
    public async Task GetPaged_ReturnsPaginatedListTypes()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);

        var result = await listTypes.GetPagedAsync(new GetListTypesRequest { currentPage = 1, pageSize = 10, search = uniqueName }, default);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Items);
        Assert.Contains(result.Items, lt => lt.Name == uniqueName);
    }

    [Fact]
    public async Task GetPaged_FilterByIsActive_ReturnsFiltered()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var activeName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var inactiveName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);

        await listTypes.CreateAsync(new CreateListTypeRequest(activeName), default);
        await listTypes.CreateAsync(new CreateListTypeRequest(inactiveName), default);
        await listTypes.DeactivateAsync((await listTypes.GetPagedAsync(new GetListTypesRequest { search = inactiveName }, default)).Items[0].Id, default);

        var activeResult = await listTypes.GetPagedAsync(new GetListTypesRequest { isActive = true }, default);
        var inactiveResult = await listTypes.GetPagedAsync(new GetListTypesRequest { isActive = false }, default);

        Assert.All(activeResult.Items, lt => Assert.True(lt.IsActive));
        Assert.All(inactiveResult.Items, lt => Assert.False(lt.IsActive));
    }

    [Fact]
    public async Task UpdateListType_ValidName_UpdatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);

        var newName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await listTypes.UpdateAsync(created.Id, new UpdateListTypeRequest(newName), default);

        var stored = await unitOfWork.ListTypeRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(newName, stored.Name);
    }

    [Fact]
    public async Task UpdateListType_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => listTypes.UpdateAsync(999999, new UpdateListTypeRequest("Name"), default));
    }

    [Fact]
    public async Task UpdateListType_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        var name1 = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var name2 = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var type1 = await listTypes.CreateAsync(new CreateListTypeRequest(name1), default);
        var type2 = await listTypes.CreateAsync(new CreateListTypeRequest(name2), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => listTypes.UpdateAsync(type2.Id, new UpdateListTypeRequest(name1), default));
    }

    [Fact]
    public async Task DeactivateListType_ActiveType_DeactivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);
        Assert.True(created.IsActive);

        await listTypes.DeactivateAsync(created.Id, default);

        var stored = await unitOfWork.ListTypeRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.False(stored.IsActive);
    }

    [Fact]
    public async Task DeactivateListType_AlreadyInactive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);
        await listTypes.DeactivateAsync(created.Id, default);
        Assert.False((await unitOfWork.ListTypeRepository.GetByIdAsync(created.Id, default))!.IsActive);

        await listTypes.DeactivateAsync(created.Id, default);

        Assert.False((await unitOfWork.ListTypeRepository.GetByIdAsync(created.Id, default))!.IsActive);
    }

    [Fact]
    public async Task DeactivateListType_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => listTypes.DeactivateAsync(999999, default));
    }

    [Fact]
    public async Task ActivateListType_InactiveType_ActivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);
        await listTypes.DeactivateAsync(created.Id, default);

        await listTypes.ActivateAsync(created.Id, default);

        var stored = await unitOfWork.ListTypeRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivateListType_AlreadyActive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "ListType_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await listTypes.CreateAsync(new CreateListTypeRequest(uniqueName), default);

        await listTypes.ActivateAsync(created.Id, default);

        Assert.True((await unitOfWork.ListTypeRepository.GetByIdAsync(created.Id, default))!.IsActive);
    }

    [Fact]
    public async Task ActivateListType_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => listTypes.ActivateAsync(999999, default));
    }

    [Fact]
    public async Task GetById_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var listTypes = scope.ServiceProvider.GetRequiredService<IListTypeService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => listTypes.GetByIdAsync(999999, default));
    }
}