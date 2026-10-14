using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class WorkReadingProgressRepository(ApplicationDbContext context) : IWorkReadingProgressRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<WorkReadingProgress?> GetByWorkIdAndUserIdAsync(long workId, long userId, CancellationToken cancellationToken = default)
    {
        return await _context.WorkReadingProgresses
            .Where(wrp => wrp.Work != null && wrp.Work.Id == workId && wrp.User != null && wrp.User.Id == userId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<WorkReadingProgress>> GetByWorkIdsAndUserIdAsync(IEnumerable<long> workIds, long userId, CancellationToken cancellationToken = default)
    {
        var requestedWorkIds = workIds.ToList();

        if (requestedWorkIds.Count == 0)
        {
            return Array.Empty<WorkReadingProgress>();
        }

        return await _context.WorkReadingProgresses
            .AsNoTracking()
            .Include(progress => progress.Work)
            .Where(progress => progress.User != null && progress.User.Id == userId && requestedWorkIds.Contains(progress.Work.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<WorkReadingProgress> Items, int TotalCount)> GetPagedHistoryByUserIdAsync(long userId, ReadingState? state, int currentPage, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.WorkReadingProgresses
            .AsNoTracking()
            .Where(progress => progress.User != null && progress.User.Id == userId && progress.Work != null && progress.Work.IsActive);

        if (state.HasValue)
        {
            query = query.Where(progress => progress.State == state.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Include(progress => progress.Work!)
            .ThenInclude(work => work.WorkType)
            .Include(progress => progress.Work!)
            .ThenInclude(work => work.Cover)
            .Include(progress => progress.Work!)
            .ThenInclude(work => work.Publisher)
            .Include(progress => progress.Work!)
            .ThenInclude(work => work.Franchise!)
            .ThenInclude(franchise => franchise.Publisher)
            .Include(progress => progress.Work!)
            .ThenInclude(work => work.Series!)
            .ThenInclude(series => series.Franchise!)
            .ThenInclude(franchise => franchise.Publisher)
            .AsSplitQuery()
            .OrderByDescending(progress => progress.LastReadAt)
            .ThenBy(progress => progress.Id)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(WorkReadingProgress progress, CancellationToken cancellationToken = default)
    {
        await _context.WorkReadingProgresses.AddAsync(progress, cancellationToken);
    }
}