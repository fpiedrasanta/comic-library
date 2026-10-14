using Application.Constants;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class PersonRepository(ApplicationDbContext context) : IPersonRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<Person>, int)> GetPagedAsync(int currentPage, int pageSize, string? search, bool? isActive, CancellationToken cancellationToken = default)
    {
        var query = _context.Persons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(p => EF.Functions.Like(p.Name, $"%{searchTerm}%"));
        }

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Person?> GetByIdAsync(long personId, CancellationToken cancellationToken = default)
    {
        return await _context.Persons
            .FirstOrDefaultAsync(p => p.Id == personId, cancellationToken);
    }

    public async Task<Person?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Persons
            .FirstOrDefaultAsync(p => EF.Functions.Like(p.Name, name), cancellationToken);
    }

    public async Task AddAsync(Person person, CancellationToken cancellationToken = default)
    {
        await _context.Persons.AddAsync(person, cancellationToken);
    }

    public Task UpdateAsync(Person person, CancellationToken cancellationToken = default)
    {
        _context.Persons.Update(person);
        return Task.CompletedTask;
    }
}
