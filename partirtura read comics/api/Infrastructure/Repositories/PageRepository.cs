using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PageRepository(ApplicationDbContext context) : IPageRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<IReadOnlyList<Page>> GetByWorkIdAsync(long workId, CancellationToken cancellationToken = default)
    {
        return await _context.Pages
            .AsNoTracking()
            .Include(p => p.Image)
            .Where(p => p.Work != null && p.Work.Id == workId)
            .OrderBy(p => p.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Page page, CancellationToken cancellationToken = default)
    {
        await _context.Pages.AddAsync(page, cancellationToken);
    }

    public void Remove(Page page)
    {
        _context.Pages.Remove(page);
    }

    public async Task DeleteByWorkIdAsync(Work work, CancellationToken cancellationToken = default)
    {
        await _context.Pages
            .Where(p => p.Work != null && p.Work.Id == work.Id)
            .ExecuteDeleteAsync(cancellationToken);
    }
}