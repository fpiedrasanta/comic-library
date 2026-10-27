using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class FranchiseService : IFranchiseService
{
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;

    public FranchiseService(
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork)
    {
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<FranchiseListItemDto>> GetPagedAsync(GetFranchisesRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 12;
        if (request.pageSize > 50) request.pageSize = 50;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.ASC;

        (IReadOnlyList<Franchise> franchises, int totalCount) = await _unitOfWork.FranchiseRepository.GetPagedAsync(
            request.currentPage, request.pageSize, request.orderBy, request.orderDir,
            request.search, null, request.IsActive, request.IsFeatured, request.IsOngoing, cancellationToken);

        var items = franchises.Select(f => new FranchiseListItemDto(
            f.Id,
            f.Name,
            f.Publisher?.Name,
            f.Publisher?.Country?.Name,
            f.Image?.Id,
            f.Color,
            f.IsFeatured,
            f.IsOngoing,
            f.IsActive)).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.pageSize);

        return new ListResponse<FranchiseListItemDto>(
            request.currentPage,
            request.currentPage < totalPages,
            request.currentPage > 1,
            totalPages,
            request.pageSize,
            request.currentPage < totalPages ? request.currentPage + 1 : null,
            request.currentPage > 1 ? request.currentPage - 1 : null,
            totalCount,
            items);
    }

    public async Task<ListResponse<CatalogFranchiseCardDto>> GetCatalogPagedAsync(GetCatalogFranchisesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);

        var (franchises, totalCount) = await _unitOfWork.FranchiseRepository.GetCatalogPagedAsync(currentPage, pageSize, request.search, request.publisherId, cancellationToken);

        var items = franchises.Select(f => new CatalogFranchiseCardDto(
            f.Id,
            f.Name,
            f.Color,
            ImageUrlBuilder.ToUrl(f.Image),
            new CatalogNodeDto(f.Publisher.Id, f.Publisher.Name, f.Publisher.Color))).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<ListResponse<FranchiseFilterDto>> GetPublicPagedAsync(GetPublicFranchisesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.CatalogFilterMaxPageSize, ref currentPage, ref pageSize);

        var (franchises, totalCount) = await _unitOfWork.FranchiseRepository.GetPagedAsync(
            currentPage, pageSize, request.orderBy, request.orderDir, request.search, request.PublisherId, true, null, null, cancellationToken);

        var items = franchises.Select(f => new FranchiseFilterDto(
            f.Id,
            f.Name,
            f.Color,
            f.Publisher?.Id,
            f.Publisher?.Name)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<PublicFranchiseDetailDto> GetPublicDetailAsync(long franchiseId, CancellationToken cancellationToken = default)
    {
        if (franchiseId <= 0)
        {
            throw new ValidationException("El identificador de la franquicia es obligatorio.");
        }

        var franchise = await _unitOfWork.FranchiseRepository.GetDetailByIdAsync(franchiseId, cancellationToken);

        if (franchise is null || !franchise.IsActive)
        {
            throw new BusinessNotFoundException("La franquicia no existe.");
        }

        return new PublicFranchiseDetailDto(
            franchise.Id,
            franchise.Name,
            franchise.Description,
            franchise.Color,
            ImageUrlBuilder.ToUrl(franchise.Image),
            franchise.GetPublisherId(),
            franchise.GetPublisherName(),
            franchise.Publisher?.Color);
    }

    public async Task<FranchiseDetailDto> GetByIdAsync(long franchiseId, CancellationToken cancellationToken = default)
    {
        var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(franchiseId, cancellationToken);
        if (franchise is null)
        {
            throw new BusinessNotFoundException("La franquicia no existe.");
        }

        return ToDetailDto(franchise);
    }

    public async Task<FranchiseDetailDto> CreateFranchiseAsync(CreateFranchiseRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId, cancellationToken);
        if (publisher is null || !publisher.IsActive)
        {
            throw new BusinessNotFoundException("La editorial no existe o no está activa.");
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            ValidateHexColor(request.Color);
        }

        Image? avatar = null;
        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            avatar = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "franchise.webp", ImageType.Avatar, cancellationToken);
            await _unitOfWork.ImageRepository.AddAsync(avatar, cancellationToken);
        }

        var franchise = new Franchise
        {
            Name = name,
            Description = request.Description?.Trim(),
            Publisher = publisher,
            Image = avatar,
            Color = request.Color?.Trim(),
            IsFeatured = request.IsFeatured,
            IsOngoing = request.IsOngoing,
            IsActive = true
        };

        try
        {
            await _unitOfWork.FranchiseRepository.AddAsync(franchise, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            if (avatar is not null)
            {
                await _fileStorageService.DeleteAsync(avatar.StoragePath, cancellationToken);
            }
            throw;
        }

        return ToDetailDto(franchise);
    }

    public async Task<FranchiseDetailDto> UpdateFranchiseAsync(long franchiseId, UpdateFranchiseRequest request, CancellationToken cancellationToken = default)
    {
        if (franchiseId <= 0)
        {
            throw new ValidationException("El identificador de la franquicia es obligatorio.");
        }

        var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(franchiseId, cancellationToken);
        if (franchise is null)
        {
            throw new BusinessNotFoundException("La franquicia no existe.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId, cancellationToken);
        if (publisher is null || !publisher.IsActive)
        {
            throw new BusinessNotFoundException("La editorial no existe o no está activa.");
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            ValidateHexColor(request.Color);
        }

        franchise.Name = name;
        franchise.Description = request.Description?.Trim();
        franchise.Publisher = publisher;
        franchise.Color = request.Color?.Trim();
        franchise.IsFeatured = request.IsFeatured;
        franchise.IsOngoing = request.IsOngoing;

        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            var oldImagePath = franchise.Image?.StoragePath;
            var newImage = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "franchise.webp", ImageType.Avatar, cancellationToken);

            try
            {
                franchise.Image = newImage;
                await _unitOfWork.FranchiseRepository.UpdateAsync(franchise, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                if (!string.IsNullOrEmpty(oldImagePath))
                {
                    await _fileStorageService.DeleteAsync(oldImagePath, cancellationToken);
                }
            }
            catch
            {
                await _fileStorageService.DeleteAsync(newImage.StoragePath, cancellationToken);
                throw;
            }
        }
        else if (request.ImageId == 0)
        {
            if (franchise.Image is not null)
            {
                var oldImagePath = franchise.Image.StoragePath;
                franchise.Image = null;
                await _unitOfWork.FranchiseRepository.UpdateAsync(franchise, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                if (!string.IsNullOrEmpty(oldImagePath))
                {
                    await _fileStorageService.DeleteAsync(oldImagePath, cancellationToken);
                }
            }
            else
            {
                await _unitOfWork.FranchiseRepository.UpdateAsync(franchise, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }
        else
        {
            await _unitOfWork.FranchiseRepository.UpdateAsync(franchise, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ToDetailDto(franchise);
    }

    public async Task DeactivateFranchiseAsync(long franchiseId, CancellationToken cancellationToken = default)
    {
        if (franchiseId <= 0)
        {
            throw new ValidationException("El identificador de la franquicia es obligatorio.");
        }

        var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(franchiseId, cancellationToken);
        if (franchise is null)
        {
            throw new BusinessNotFoundException("La franquicia no existe.");
        }

        if (!franchise.IsActive)
        {
            return;
        }

        franchise.IsActive = false;
        await _unitOfWork.FranchiseRepository.UpdateAsync(franchise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateFranchiseAsync(long franchiseId, CancellationToken cancellationToken = default)
    {
        if (franchiseId <= 0)
        {
            throw new ValidationException("El identificador de la franquicia es obligatorio.");
        }

        var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(franchiseId, cancellationToken);
        if (franchise is null)
        {
            throw new BusinessNotFoundException("La franquicia no existe.");
        }

        if (franchise.IsActive)
        {
            return;
        }

        franchise.IsActive = true;
        await _unitOfWork.FranchiseRepository.UpdateAsync(franchise, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color) || !System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$"))
        {
            throw new ValidationException("El color debe ser un valor hexadecimal válido en formato #RRGGBB.");
        }
    }

    private static FranchiseDetailDto ToDetailDto(Franchise franchise)
    {
        return new FranchiseDetailDto(
            franchise.Id,
            franchise.Name,
            franchise.Description,
            franchise.Publisher?.Id ?? 0,
            franchise.Publisher?.Name,
            franchise.Publisher?.Country?.Name,
            franchise.Image?.Id,
            franchise.Color,
            franchise.IsFeatured,
            franchise.IsOngoing,
            franchise.IsActive);
    }
}
