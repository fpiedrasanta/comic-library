using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
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
public class EditGraphicNovelWorkflowIntegrationTests
{
    private readonly string _coverImagePath;
    private readonly IntegrationTestFixture _fixture;

    public EditGraphicNovelWorkflowIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
        _coverImagePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "fly-01f-tyler-kirkham.webp");
        _coverImagePath = Path.GetFullPath(_coverImagePath);
    }

    [Fact]
    public async Task EditExistingActiveWork_EndToEnd()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var coverData = await System.IO.File.ReadAllBytesAsync(_coverImagePath, default);

        var workType = await EnsureWorkTypeAsync(dbContext, "GraphicNovel");
        var allFranchises = await franchises.GetPagedAsync(new GetFranchisesRequest { IsActive = true, currentPage = 1, pageSize = 100 }, default);
        Assert.NotEmpty(allFranchises.Items);

        // Find a franchise that has works of this WorkType, or create one
        long? targetFranchiseId = null;
        long targetWorkId = 0;

        foreach (var frac in allFranchises.Items)
        {
            var worksResponse = await workService.GetPagedAsync(new GetWorksRequest(1, 100, null, null, null, workType.Id, true, null, null, null, null, null, frac.Id), default);
            if (worksResponse.Items.Count > 0)
            {
                targetWorkId = worksResponse.Items.First().Id;
                targetFranchiseId = frac.Id;
                break;
            }
        }

        // If no existing work with this WorkType+Franchise, create one
        if (targetWorkId == 0)
        {
            targetFranchiseId = allFranchises.Items.First().Id;
            var language = (await dbContext.Languages.FirstOrDefaultAsync())!;
            
            var createdWork = await workService.CreateAsync(new CreateWorkRequest(
                WorkTypeId: workType.Id,
                Title: "Test Graphic Novel " + Guid.NewGuid().ToString("N").Substring(0, 8),
                Description: "Created by integration test",
                LanguageId: language.Id,
                CoverImageId: null,
                PublicationDate: DateTime.UtcNow,
                SeriesId: null,
                FranchiseId: targetFranchiseId,
                PublisherId: null,
                NumberValue: null,
                PreviousNumberId: null,
                NextNumberId: null,
                PersonByRoles: new List<PersonByRoleRequest>(),
                Tags: new List<TagRequest>(),
                CoverData: coverData,
                CoverFileName: "test-cover.webp"), default);
            
            targetWorkId = createdWork.Id;
        }

        Assert.NotEqual(0, targetWorkId);
        Console.WriteLine($"DEBUG: Selected Work Id={targetWorkId}");

        var targetDetail = await workService.GetByIdAsync(targetWorkId, default);
        Assert.NotNull(targetDetail);

        var originalTitle = targetDetail.Title;
        var newTitle = "Edited_" + Guid.NewGuid().ToString("N").Substring(0, 8);
        var updatedDescription = "Edited by integration test";

        var allRoles = await roles.GetPagedAsync(new GetRolesRequest { currentPage = 1, pageSize = 100 }, default);
        var allPersons = await persons.GetPagedAsync(new GetPersonsRequest { currentPage = 1, pageSize = 100 }, default);

        var currentPersonIds = targetDetail.PersonByRoles?.Select(p => p.PersonId!.Value).ToHashSet() ?? new HashSet<long>();
        var currentRoleIds = targetDetail.PersonByRoles?.Select(p => p.RoleId!.Value).ToHashSet() ?? new HashSet<long>();

        var newPerson = allPersons.Items.FirstOrDefault(p => !currentPersonIds.Contains(p.Id));
        if (newPerson is null)
        {
            var created = await persons.CreatePersonAsync(new CreatePersonRequest("Person_" + Guid.NewGuid().ToString("N").Substring(0, 6)), default);
            newPerson = created;
        }

        var newRole = allRoles.Items.FirstOrDefault(r => !currentRoleIds.Contains(r.Id));
        if (newRole is null)
        {
            var created = await roles.CreateRoleAsync(new CreateRoleRequest("Role_" + Guid.NewGuid().ToString("N").Substring(0, 6)), default);
            newRole = created;
        }

        var newTagName = "EditedTag_" + Guid.NewGuid().ToString("N").Substring(0, 6);

        using var editScope = _fixture.ScopeFactory.CreateScope();
        var workServiceFresh = editScope.ServiceProvider.GetRequiredService<IWorkService>();

        // For GraphicNovel (WorkType), only pass the direct parent (FranchiseId), not SeriesId or PublisherId
        var updatedWork = await workServiceFresh.UpdateAsync(targetWorkId, new UpdateWorkRequest(
            WorkTypeId: workType.Id,
            Title: newTitle,
            Description: updatedDescription,
            LanguageId: targetDetail.LanguageId ?? 1,
            CoverImageId: null,
            PublicationDate: DateTime.UtcNow,
            SeriesId: null,  // GraphicNovel doesn't have Series
            FranchiseId: targetDetail.FranchiseId,  // Only the direct parent
            PublisherId: null,
            NumberValue: null,
            PreviousNumberId: null,
            NextNumberId: null,
            PersonByRoles: new List<PersonByRoleRequest> { new(newPerson.Id, newRole.Id) },
            Tags: new List<TagRequest> { new TagRequest(0, newTagName) },
            CoverData: coverData,
            CoverFileName: "edited-cover.webp"), default);

        Assert.NotNull(updatedWork);
        Assert.Equal(newTitle, updatedWork.Title);
        Assert.Equal(updatedDescription, updatedWork.Description);
        Assert.Single(updatedWork.PersonByRoles!);
        Assert.Equal(newPerson.Id, updatedWork?.PersonByRoles?[0].PersonId);
        Assert.Equal(newRole.Id, updatedWork?.PersonByRoles?[0].RoleId);
        Assert.Single(updatedWork?.Tags!);
        Assert.Equal(newTagName, updatedWork?.Tags?[0].Name);
        Assert.NotNull(updatedWork?.UrlCover);
        Console.WriteLine($"DEBUG: Work updated Id={updatedWork.Id}");

        using var verifyScope = _fixture.ScopeFactory.CreateScope();
        var workServiceVerify = verifyScope.ServiceProvider.GetRequiredService<IWorkService>();
        var verifiedWork = await workServiceVerify.GetByIdAsync(targetWorkId, default);

        Assert.NotNull(verifiedWork);
        Assert.Equal(newTitle, verifiedWork.Title);
        Assert.Equal(updatedDescription, verifiedWork.Description);
        Assert.Single(verifiedWork.PersonByRoles!);
        Assert.Equal(newPerson.Id, verifiedWork?.PersonByRoles?[0].PersonId);
        Assert.Equal(newRole.Id, verifiedWork?.PersonByRoles?[0].RoleId);
        Assert.Single(verifiedWork?.Tags!);
        Assert.Equal(newTagName, verifiedWork?.Tags?[0].Name);
        Assert.NotNull(verifiedWork?.UrlCover);
        Console.WriteLine($"DEBUG: Work verified Id={verifiedWork.Id}");
    }

    private static async Task<WorkType> EnsureWorkTypeAsync(ApplicationDbContext dbContext, string name)
    {
        var existing = await dbContext.WorkTypes.FirstOrDefaultAsync(w => w.Name == name);
        if (existing is not null)
        {
            return existing;
        }

        var workType = new WorkType
        {
            Name = name,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.WorkTypes.Add(workType);
        await dbContext.SaveChangesAsync();
        return workType;
    }
}