using Domain.Exceptions;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class FavoriteService : IFavoriteService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<FavoriteService> _logger;

    public FavoriteService(IUnitOfWork unitOfWork, ILogger<FavoriteService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task AddFavoriteAsync(long workId, long userId, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new BusinessNotFoundException("Usuario no encontrado");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken);
        if (work == null || !work.IsActive)
        {
            throw new BusinessNotFoundException("Work no encontrado o inactivo");
        }

        if (await _unitOfWork.Favorites.ExistsAsync(userId, workId, cancellationToken))
        {
            throw new BusinessConflictException("El Work ya está en favoritos");
        }

        var favorite = new Favorite
        {
            User = user,
            Work = work,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Favorites.AddAsync(favorite, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveFavoriteAsync(long workId, long userId, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new BusinessNotFoundException("Usuario no encontrado");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken);
        if (work == null || !work.IsActive)
        {
            throw new BusinessNotFoundException("Work no encontrado o inactivo");
        }

        var favorite = await _unitOfWork.Favorites.GetAsync(userId, workId, cancellationToken);
        if (favorite == null)
        {
            throw new BusinessNotFoundException("Favorito no encontrado");
        }

        await _unitOfWork.Favorites.RemoveAsync(favorite, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

