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
public class TagAdministrationIntegrationTests
{
    private readonly IntegrationTestFixture _fixture;

    public TagAdministrationIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateTag_ValidName_ReturnsCreatedTag()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var request = new CreateTagRequest(uniqueName);

        var result = await tags.CreateTagAsync(request, default);

        Assert.NotNull(result);
        Assert.Equal(uniqueName, result.Name);
        Assert.True(result.IsActive);

        var stored = await unitOfWork.TagRepository.GetByIdAsync(result.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(uniqueName, stored.Name);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task CreateTag_EmptyName_ThrowsValidationException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        await Assert.ThrowsAsync<ValidationException>(() => tags.CreateTagAsync(new CreateTagRequest(""), default));
        await Assert.ThrowsAsync<ValidationException>(() => tags.CreateTagAsync(new CreateTagRequest("   "), default));
    }

    [Fact]
    public async Task CreateTag_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => tags.CreateTagAsync(new CreateTagRequest(uniqueName), default));
    }

    [Fact]
    public async Task GetPaged_ReturnsPaginatedTags()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);

        var result = await tags.GetPagedAsync(new GetTagsRequest { currentPage = 1, pageSize = 10, search = uniqueName }, default);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Items);
        Assert.Contains(result.Items, t => t.Name == uniqueName);
    }

    [Fact]
    public async Task UpdateTag_ValidName_UpdatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);

        var newName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var updated = await tags.UpdateTagAsync(created.Id, new UpdateTagRequest { Name = newName }, default);

        Assert.NotNull(updated);
        Assert.Equal(created.Id, updated.Id);
        Assert.Equal(newName, updated.Name);

        var stored = await unitOfWork.TagRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.Equal(newName, stored.Name);
    }

    [Fact]
    public async Task UpdateTag_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => tags.UpdateTagAsync(999999, new UpdateTagRequest { Name = "Name" }, default));
    }

    [Fact]
    public async Task UpdateTag_DuplicateName_ThrowsBusinessConflictException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        var name1 = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var name2 = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var tag1 = await tags.CreateTagAsync(new CreateTagRequest(name1), default);
        var tag2 = await tags.CreateTagAsync(new CreateTagRequest(name2), default);

        await Assert.ThrowsAsync<BusinessConflictException>(() => tags.UpdateTagAsync(tag2.Id, new UpdateTagRequest { Name = name1 }, default));
    }

    [Fact]
    public async Task DeactivateTag_ActiveTag_DeactivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);
        Assert.True(created.IsActive);

        await tags.DeactivateTagAsync(created.Id, default);

        var stored = await unitOfWork.TagRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.False(stored.IsActive);
    }

    [Fact]
    public async Task DeactivateTag_AlreadyInactive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);
        await tags.DeactivateTagAsync(created.Id, default);
        var storedAfterFirst = await unitOfWork.TagRepository.GetByIdAsync(created.Id, default);
        Assert.False(storedAfterFirst.IsActive);

        await tags.DeactivateTagAsync(created.Id, default);

        var storedAfterSecond = await unitOfWork.TagRepository.GetByIdAsync(created.Id, default);
        Assert.False(storedAfterSecond.IsActive);
    }

    [Fact]
    public async Task DeactivateTag_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => tags.DeactivateTagAsync(999999, default));
    }

    [Fact]
    public async Task ActivateTag_InactiveTag_ActivatesSuccessfully()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);
        await tags.DeactivateTagAsync(created.Id, default);

        await tags.ActivateTagAsync(created.Id, default);

        var stored = await unitOfWork.TagRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivateTag_AlreadyActive_ReturnsWithoutError()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var uniqueName = "Tag_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var created = await tags.CreateTagAsync(new CreateTagRequest(uniqueName), default);

        await tags.ActivateTagAsync(created.Id, default);

        var stored = await unitOfWork.TagRepository.GetByIdAsync(created.Id, default);
        Assert.NotNull(stored);
        Assert.True(stored.IsActive);
    }

    [Fact]
    public async Task ActivateTag_NonExistent_ThrowsBusinessNotFoundException()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();

        await Assert.ThrowsAsync<BusinessNotFoundException>(() => tags.ActivateTagAsync(999999, default));
    }
}