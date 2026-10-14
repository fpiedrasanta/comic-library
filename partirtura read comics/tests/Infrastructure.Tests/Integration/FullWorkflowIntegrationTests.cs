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
public class FullWorkflowIntegrationTests
{
    private const string CbrRelativePath = "Integration/Assets/taskmaster-vol3-02.cbr";
    private readonly string _cbrPath;
    private readonly string _avatarImagePath;
    private readonly string _coverImagePath;
    private readonly IntegrationTestFixture _fixture;

    public FullWorkflowIntegrationTests(IntegrationTestFixture fixture)
    {
        _fixture = fixture;
        _cbrPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Integration", "Assets", "taskmaster-vol3-02.cbr");
        _avatarImagePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "s-l1200.jpg");
        _coverImagePath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "fly-01f-tyler-kirkham.webp");

        _cbrPath = Path.GetFullPath(_cbrPath);
        _avatarImagePath = Path.GetFullPath(_avatarImagePath);
        _coverImagePath = Path.GetFullPath(_coverImagePath);
    }

    private static string NextName(string baseName) => $"{baseName}_TEST_{Guid.NewGuid():N}";

    [Fact]
    public async Task FullWorkflow_Work_EndToEnd()
    {
        using var scope = _fixture.ScopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var countries = scope.ServiceProvider.GetRequiredService<ICountryService>();
        var publishers = scope.ServiceProvider.GetRequiredService<IPublisherService>();
        var franchises = scope.ServiceProvider.GetRequiredService<IFranchiseService>();
        var seriesService = scope.ServiceProvider.GetRequiredService<ISeriesService>();
        var workService = scope.ServiceProvider.GetRequiredService<IWorkService>();
        var workContent = scope.ServiceProvider.GetRequiredService<IWorkContentService>();
        var roles = scope.ServiceProvider.GetRequiredService<IRoleService>();
        var persons = scope.ServiceProvider.GetRequiredService<IPersonService>();
        var tags = scope.ServiceProvider.GetRequiredService<ITagService>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var avatarData = await System.IO.File.ReadAllBytesAsync(_avatarImagePath, default);
        var coverData = await System.IO.File.ReadAllBytesAsync(_coverImagePath, default);
        var cbrData = await System.IO.File.ReadAllBytesAsync(_cbrPath, default);

        var workType = await EnsureWorkTypeAsync(dbContext, "Number");

        var country = await countries.CreateCountryAsync(new CreateCountryRequest { Code = "AR_" + Guid.NewGuid().ToString("N").Substring(0, 6), Name = "Argentina_" + Guid.NewGuid().ToString("N").Substring(0, 6) }, default);

        var publisher = await publishers.CreatePublisherAsync(new CreatePublisherRequest(
            Name: NextName("Test Publisher"),
            Description: "Integration test publisher",
            Website: "https://example.com",
            CountryId: country.Id,
            FoundedYear: 1990,
            History: "Created for integration testing",
            IsAlive: true,
            AvatarData: avatarData,
            AvatarFileName: "avatar.jpg",
            Color: "#FF0000",
            IsFeatured: true), default);

        var franchise = await franchises.CreateFranchiseAsync(new CreateFranchiseRequest(
            Name: NextName("Test Franchise"),
            Description: "Integration test franchise",
            PublisherId: publisher.Id,
            Color: "#00FF00",
            IsFeatured: true,
            IsOngoing: true,
            AvatarData: coverData,
            AvatarFileName: "cover.webp"), default);

        var createdSeries = await seriesService.CreateSeriesAsync(new CreateSeriesRequest(
            Name: NextName("Test Series"),
            Description: "Series description for the end-to-end workflow.",
            FranchiseId: franchise.Id,
            Color: "#0000FF",
            IsFeatured: true,
            IsOngoing: true,
            AvatarData: avatarData,
            AvatarFileName: "avatar.jpg"), default);

        var language = await unitOfWork.LanguageRepository.GetByIdAsync(1, default) ?? throw new BusinessNotFoundException("Language not found.");

        var work = await workService.CreateWithContentAsync(new CreateWorkWithContentRequest(
            WorkTypeId: workType.Id,
            Title: NextName("Test Work"),
            SeriesId: createdSeries.Id,
            LanguageId: language.Id,
            ContentFileData: cbrData,
            ContentFileName: "taskmaster.cbr"), default);

        Assert.NotNull(work);
        Assert.Equal(ContentStatus.Missing, work.ContentStatus);
        Console.WriteLine($"DEBUG: Work created Id={work.Id}, ContentStatus={work.ContentStatus}");

        await WaitForWorkContentAsync(work.Id, _fixture.ScopeFactory, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(5), TimeSpan.FromMinutes(2));
        Console.WriteLine($"DEBUG: WaitForContentAsync finished for Work {work.Id}");

        using var workAfterProcessingScope = _fixture.ScopeFactory.CreateScope();
        var workContentFresh = workAfterProcessingScope.ServiceProvider.GetRequiredService<IWorkContentService>();
        var images = await workContentFresh.GetImagesAsync(work.Id, default);
        Assert.NotEmpty(images.Images);
        Console.WriteLine($"DEBUG: Work images count={images.Images.Count}");

        var role = await roles.CreateRoleAsync(new CreateRoleRequest("Writer_" + Guid.NewGuid().ToString("N").Substring(0, 6)), default);
        Console.WriteLine($"DEBUG: Role created Id={role.Id}");

        var person = await persons.CreatePersonAsync(new CreatePersonRequest("Person_" + Guid.NewGuid().ToString("N").Substring(0, 6)), default);
        Console.WriteLine($"DEBUG: Person created Id={person.Id}");

        using var workUpdateScope = _fixture.ScopeFactory.CreateScope();
        var workServiceFresh = workUpdateScope.ServiceProvider.GetRequiredService<IWorkService>();
        var updatedWork = await workServiceFresh.UpdateAsync(work.Id, new UpdateWorkRequest(
            WorkTypeId: workType.Id,
            Title: work.Title,
            Description: "Updated description",
            LanguageId: language.Id,
            CoverImageId: null,
            PublicationDate: DateTime.UtcNow,
            SeriesId: createdSeries.Id,
            FranchiseId: null,
            PublisherId: null,
            NumberValue: "1",
            PreviousNumberId: null,
            NextNumberId: null,
            PersonByRoles: new List<PersonByRoleRequest> { new(person.Id, role.Id) },
            Tags: new List<TagRequest> { new TagRequest(0, "TestTag") },
            CoverData: coverData,
            CoverFileName: "cover.webp"), default);

        Assert.NotNull(updatedWork);
        Assert.Equal("Updated description", updatedWork.Description);
        Assert.Single(updatedWork.PersonByRoles!);
        Assert.Single(updatedWork.Tags!);
        Console.WriteLine($"DEBUG: Work updated Id={updatedWork.Id}");
    }

    private static async Task WaitForWorkContentAsync(long workId, IServiceScopeFactory scopeFactory, TimeSpan initialDelay, TimeSpan pollInterval, TimeSpan timeout)
    {
        await Task.Delay(initialDelay);

        var deadline = DateTime.UtcNow.Add(timeout);
        while (DateTime.UtcNow < deadline)
        {
            using var scope = scopeFactory.CreateScope();
            var contentService = scope.ServiceProvider.GetRequiredService<IWorkContentService>();
            var status = await contentService.GetContentStatusAsync(workId, default);
            Console.WriteLine($"Work {workId} status: {status.Status} at {DateTime.UtcNow}");
            if (status.Status == "Completed" || status.Status == "Error")
            {
                if (status.Status == "Error")
                {
                    throw new InvalidOperationException($"Content processing failed for work {workId}: {status.Error}");
                }
                return;
            }
            await Task.Delay(pollInterval);
        }

        throw new InvalidOperationException($"Content processing timed out for work {workId} after {timeout.TotalMinutes} minutes.");
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