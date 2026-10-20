using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WorkListItemRepository(ApplicationDbContext context) : IWorkListItemRepository
{
    private readonly ApplicationDbContext _context = context;

    public Task<WorkListItem?> GetAsync(long workListId, long workId, CancellationToken cancellationToken = default)
    {
        return _context.WorkListItems
            .Include(item => item.Work)
            .FirstOrDefaultAsync(item => item.WorkList.Id == workListId && item.Work.Id == workId, cancellationToken);
    }

    public async Task<IReadOnlyList<WorkListItem>> GetByWorkListAsync(long workListId, CancellationToken cancellationToken = default)
    {
        return await _context.WorkListItems
            .Include(item => item.Work)
            .Where(item => item.WorkList.Id == workListId)
            .OrderBy(item => item.Position)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Highest position of the list, or -1 when the list has no items (the first work of a list
    /// therefore takes position 0, the convention used by the rest of the project).
    /// </summary>
    public async Task<int> GetMaxPositionAsync(long workListId, CancellationToken cancellationToken = default)
    {
        var maxPosition = await _context.WorkListItems
            .Where(item => item.WorkList.Id == workListId)
            .MaxAsync(item => (int?)item.Position, cancellationToken);

        return maxPosition ?? -1;
    }

    public async Task AddAsync(WorkListItem workListItem, CancellationToken cancellationToken = default)
    {
        await _context.WorkListItems.AddAsync(workListItem, cancellationToken);
    }

    public Task UpdateAsync(WorkListItem workListItem, CancellationToken cancellationToken = default)
    {
        _context.WorkListItems.Update(workListItem);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(WorkListItem workListItem, CancellationToken cancellationToken = default)
    {
        _context.WorkListItems.Remove(workListItem);
        return Task.CompletedTask;
    }
}
