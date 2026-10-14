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
public class PersonAdministrationIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public PersonAdministrationIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreatePerson_ValidName_ReturnsCreatedPerson()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var request = new CreatePersonRequest(uniqueName);

        var result = await persons.CreatePersonAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal(uniqueName, result.Name);
        Assert.True(result.IsActive);

        var stored = await unitOfWork.PersonRepository.GetByIdAsync(result.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(uniqueName, stored.Name);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task CreatePerson_EmptyName_ThrowsValidationException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        await Assert.ThrowsAsync<ValidationException>(() => persons.CreatePersonAsync(new CreatePersonRequest(""), default));
        await Assert.ThrowsAsync<ValidationException>(() => persons.CreatePersonAsync(new CreatePersonRequest("   "), default));
    }

    [Fact]
    public async Task CreatePerson_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default));
    }

    [Fact]
    public async Task GetPaged_ReturnsPaginatedPersons()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);

        var result = await persons.GetPagedAsync(new GetPersonsRequest { currentPage = 1, pageSize = 10, search = uniqueName }, default);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Items);
        Assert.Contains(result.Items, p => p.Name == uniqueName);
    }

    [Fact]
    public async Task UpdatePerson_ValidName_UpdatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);

        var newName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var updated = await persons.UpdatePersonAsync(created.Id, new UpdatePersonRequest(newName), default);

        Assert.NotNull(updated);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(newName, updated.Name);
        Assert.True(updated.IsActive);

        var stored = await unitOfWork.PersonRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(newName, stored.Name);
    }

    [Fact]
    public async Task UpdatePerson_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => persons.UpdatePersonAsync(999999, new UpdatePersonRequest("Name"), default));
    }

    [Fact]
    public async Task UpdatePerson_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        var name1 = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var name2 = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var person1 = await persons.CreatePersonAsync(new CreatePersonRequest(name1), default);
        var person2 = await persons.CreatePersonAsync(new CreatePersonRequest(name2), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => persons.UpdatePersonAsync(person2.Id, new UpdatePersonRequest(name1), default));
    }

    [Fact]
    public async Task DeactivatePerson_ActivePerson_DeactivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);
        Assert.True(created.IsActive);

        await persons.DeactivatePersonAsync(created.Id, default);

        var stored = await unitOfWork.PersonRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.False(stored.IsActive);
    }

    [Fact]
    public async Task DeactivatePerson_AlreadyInactive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);
        await persons.DeactivatePersonAsync(created.Id, default);
        var storedAfterFirst = await unitOfWork.PersonRepository.GetByIdAsync(created.Id, default);
        Assert.False(storedAfterFirst.IsActive);

        await persons.DeactivatePersonAsync(created.Id, default);

        var storedAfterSecond = await unitOfWork.PersonRepository.GetByIdAsync(created.Id, default);
        Assert.False(storedAfterSecond.IsActive);
    }

    [Fact]
    public async Task DeactivatePerson_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => persons.DeactivatePersonAsync(999999, default));
    }

    [Fact]
    public async Task ActivatePerson_InactivePerson_ActivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);
        await persons.DeactivatePersonAsync(created.Id, default);

        await persons.ActivatePersonAsync(created.Id, default);

        var stored = await unitOfWork.PersonRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivatePerson_AlreadyActive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Person_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await persons.CreatePersonAsync(new CreatePersonRequest(uniqueName), default);

        await persons.ActivatePersonAsync(created.Id, default);

        var stored = await unitOfWork.PersonRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivatePerson_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => persons.ActivatePersonAsync(999999, default));
    }
}