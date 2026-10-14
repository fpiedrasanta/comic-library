using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class ImageRepository(ApplicationDbContext context) : IImageRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Image?> GetByIdAsync(long imageId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<Image>()
            .FirstOrDefaultAsync(i => i.Id == imageId, cancellationToken);
    }

    public async Task AddAsync(Image image, CancellationToken cancellationToken = default)
    {
        await _context.Set<Image>().AddAsync(image, cancellationToken);
    }

    public void Remove(Image image)
    {
        _context.Set<Image>().Remove(image);
    }
}
