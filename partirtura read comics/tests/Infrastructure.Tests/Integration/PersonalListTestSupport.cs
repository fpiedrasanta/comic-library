using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Tests.Integration;

internal static class PersonalListTestSupport
{
    public static async Task<long> CreatePersonalListAsync(IntegrationTestFixture fixture, long userId, string? name = null)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var personalListService = scope.ServiceProvider.GetRequiredService<IPersonalListService>();

        var request = new CreatePersonalListRequest(name ?? $"US-0036 lista {Guid.NewGuid():N}");
        var created = await personalListService.CreateAsync(request, userId, default);

        return created.Id;
    }

    public static async Task<WorkList?> GetListAsync(IntegrationTestFixture fixture, long listId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.WorkLists
            .AsNoTracking()
            .Include(workList => workList.Cover)
            .Include(workList => workList.ListType)
            .Include(workList => workList.Owner)
            .FirstOrDefaultAsync(workList => workList.Id == listId, default);
    }

    public static async Task<int> CountItemsAsync(IntegrationTestFixture fixture, long listId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.WorkListItems
            .AsNoTracking()
            .CountAsync(item => item.WorkList.Id == listId, default);
    }

    public static async Task<IReadOnlyList<(long WorkId, int Position)>> GetItemPositionsAsync(IntegrationTestFixture fixture, long listId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var items = await dbContext.WorkListItems
            .AsNoTracking()
            .Where(item => item.WorkList.Id == listId)
            .OrderBy(item => item.Position)
            .Select(item => new { item.Work.Id, item.Position })
            .ToListAsync(default);

        return items.Select(item => (item.Id, item.Position)).ToList();
    }

    public static async Task<int> CountSystemListsAsync(IntegrationTestFixture fixture)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await dbContext.WorkLists
            .AsNoTracking()
            .CountAsync(workList => workList.OwnerType == OwnerType.System && workList.IsActive, default);
    }

    public static async Task<long> GetFirstSystemListIdAsync(IntegrationTestFixture fixture)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var systemListId = await dbContext.WorkLists
            .AsNoTracking()
            .Where(workList => workList.OwnerType == OwnerType.System && workList.IsActive)
            .OrderBy(workList => workList.Id)
            .Select(workList => (long?)workList.Id)
            .FirstOrDefaultAsync(default);

        return systemListId ?? throw new InvalidOperationException("The development database does not have system work lists.");
    }

    public static async Task CleanupAsync(IntegrationTestFixture fixture, long listId)
    {
        using var scope = fixture.ScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var fileStorageService = scope.ServiceProvider.GetRequiredService<IFileStorageService>();

        var workList = await dbContext.WorkLists
            .Include(list => list.WorkListItems)
            .Include(list => list.Cover)
            .FirstOrDefaultAsync(list => list.Id == listId, default);

        if (workList is null)
        {
            return;
        }

        var coverPath = workList.Cover?.StoragePath;
        var coverId = workList.Cover?.Id;

        dbContext.WorkLists.Remove(workList);

        if (coverId.HasValue)
        {
            var cover = await dbContext.Files.FirstOrDefaultAsync(file => file.Id == coverId.Value, default);
            if (cover is not null)
            {
                dbContext.Files.Remove(cover);
            }
        }

        await dbContext.SaveChangesAsync(default);

        if (!string.IsNullOrWhiteSpace(coverPath))
        {
            await fileStorageService.DeleteAsync(coverPath, default);
        }
    }
}
