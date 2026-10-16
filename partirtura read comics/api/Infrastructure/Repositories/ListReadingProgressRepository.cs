using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ListReadingProgressRepository(ApplicationDbContext context) : IListReadingProgressRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<ListReadingProgress?> GetByUserIdAndWorkListIdAsync(long userId, long workListId, CancellationToken cancellationToken = default)
    {
        return await _context.ListReadingProgresses
            .Include(progress => progress.CurrentWork)
            .FirstOrDefaultAsync(progress =>
                progress.User != null && progress.User.Id == userId &&
                progress.WorkList != null && progress.WorkList.Id == workListId, cancellationToken);
    }

    public async Task AddAsync(ListReadingProgress progress, CancellationToken cancellationToken = default)
    {
        await _context.ListReadingProgresses.AddAsync(progress, cancellationToken);
    }

    public Task UpdateAsync(ListReadingProgress progress, long currentWorkId, CancellationToken cancellationToken = default)
    {
        _context.Entry(progress).Property("CurrentWorkId").CurrentValue = currentWorkId;
        progress.LastReadAt = DateTimeOffset.UtcNow;
        _context.Entry(progress).Property(progress => progress.LastReadAt).IsModified = true;
        return Task.CompletedTask;
    }
}
