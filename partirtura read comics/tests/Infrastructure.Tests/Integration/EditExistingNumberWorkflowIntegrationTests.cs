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
public class EditExistingNumberWorkflowIntegrationTests
{
    private readonly string _coverImagePath;
    private readonly IntegrationTestFixture _fixture;

    public EditExistingNumberWorkflowIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
        _coverImagePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "fly-01f-tyler-kirkham.webp");
        _coverImagePath = Path.GetFullPath(_coverImagePath);
    }

    [Fact]
    public async Task EditExistingActiveNumber_EndToEnd()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var coverData = await System.IO.File.ReadAllBytesAsync(_coverImagePath, default);

        var workType = await EnsureWorkTypeAsync(dbContext, "Number");
        var allSeries = await seriesService.GetPagedAsync(new GetSeriesRequest { IsActive = true, currentPage = 1, pageSize = 100 }, default);
        Assert.NotEmpty(allSeries.Items);

        long? targetSeriesId = null;
        long targetWorkId = 0;

        foreach (var serie in allSeries.Items)
        {
            var worksResponse = await workService.GetPagedAsync(new GetWorksRequest(1, 100, null, null, null, workType.Id, true, null, null, null, null, null, null, serie.Id), default);
            if (worksResponse.Items.Count == 0)
            {
                continue;
            }

            targetWorkId = worksResponse.Items.First().Id;
            targetSeriesId = serie.Id;
            break;
        }

        if (targetWorkId == 0)
        {
            // The test must not depend on the data that other tests leave behind: when no Number work
            // is available inside an active series, it creates its own.
            targetSeriesId = allSeries.Items.First().Id;
            var languageId = await dbContext.Languages.Select(language => language.Id).FirstAsync();
            targetWorkId = await CreateNumberWorkAsync(workService, workType.Id, targetSeriesId.Value, languageId, coverData);
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

        // For Number (WorkType), only pass SeriesId (the direct parent), not FranchiseId or PublisherId
        var updatedWork = await workServiceFresh.UpdateAsync(targetWorkId, new UpdateWorkRequest(
            WorkTypeId: workType.Id,
            Title: newTitle,
            Description: updatedDescription,
            LanguageId: targetDetail.LanguageId ?? 1,
            CoverImageId: null,
            PublicationDate: DateTime.UtcNow,
            SeriesId: targetDetail.SeriesId,  // Only the direct parent for Number
            FranchiseId: null,
            PublisherId: null,
            NumberValue: targetDetail.NumberValue,
            PreviousNumberId: targetDetail.PreviousNumber?.Id,
            NextNumberId: targetDetail.NextNumber?.Id,
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

    private static async Task<long> CreateNumberWorkAsync(IWorkService workService, long workTypeId, long seriesId, long languageId, byte[] coverData)
    {
        var created = await workService.CreateAsync(new CreateWorkRequest(
            WorkTypeId: workTypeId,
            Title: "Test Number_" + Guid.NewGuid().ToString("N").Substring(0, 8),
            Description: "Created by the edit workflow integration test",
            LanguageId: languageId,
            PublicationDate: DateTime.UtcNow,
            CoverImageId: null,
            SeriesId: seriesId,
            FranchiseId: null,
            PublisherId: null,
            NumberValue: "TEST-" + Guid.NewGuid().ToString("N").Substring(0, 4),
            PreviousNumberId: null,
            NextNumberId: null,
            PersonByRoles: new List<PersonByRoleRequest>(),
            Tags: new List<TagRequest>(),
            CoverData: coverData,
            CoverFileName: "number-cover.webp"), default);

        return created.Id;
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