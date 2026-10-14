using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class PublisherService : IPublisherService
{
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;

    public PublisherService(IFileStorageService fileStorageService, IUnitOfWork unitOfWork)
    {
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<AdminPublisherListItemDto>> GetPagedAsync(GetPublishersRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 12;
        if (request.pageSize > 50) request.pageSize = 50;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.ASC;

        (IReadOnlyList<Publisher> publishers, int totalCount) = await _unitOfWork.PublisherRepository.GetPagedAsync(request.currentPage, request.pageSize, request.orderBy, request.orderDir, request.search, request.IsActive, request.IsFeatured, request.IsAlive, cancellationToken);

        var items = publishers.Select(p =>
        {
            string? avatarUrl = null;
            if (p.Image is not null)
            {
                avatarUrl = $"/images/{p.Image.Id}";
            }

            return new AdminPublisherListItemDto(
                p.Id,
                p.Name,
                p.Country != null ? p.Country.Name : null,
                p.Color,
                avatarUrl,
                p.IsAlive,
                p.IsFeatured,
                p.IsActive,
                p.CreatedAt);
        }).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.pageSize);

        return new ListResponse<AdminPublisherListItemDto>(
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

    public async Task<ListResponse<CatalogPublisherCardDto>> GetCatalogPagedAsync(GetCatalogPublishersRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);

        var (publishers, totalCount) = await _unitOfWork.PublisherRepository.GetCatalogPagedAsync(currentPage, pageSize, request.search, cancellationToken);

        var items = publishers.Select(p => new CatalogPublisherCardDto(
            p.Id,
            p.Name,
            p.Color,
            ImageUrlBuilder.ToUrl(p.Image))).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<ListResponse<PublisherFilterDto>> GetPublicPagedAsync(ListRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.CatalogFilterMaxPageSize, ref currentPage, ref pageSize);

        var (publishers, totalCount) = await _unitOfWork.PublisherRepository.GetPagedAsync(
            currentPage, pageSize, request.orderBy, request.orderDir, request.search, true, null, null, cancellationToken);

        var items = publishers.Select(p => new PublisherFilterDto(p.Id, p.Name, p.Color)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<PublisherDetailDto> GetPublicDetailAsync(long publisherId, CancellationToken cancellationToken = default)
    {
        if (publisherId <= 0)
        {
            throw new ValidationException("El identificador de la editorial es obligatorio.");
        }

        var publisher = await _unitOfWork.PublisherRepository.GetDetailByIdAsync(publisherId, cancellationToken);

        if (publisher is null || !publisher.IsActive)
        {
            throw new BusinessNotFoundException("La editorial no existe.");
        }

        return new PublisherDetailDto(
            publisher.Id,
            publisher.Name,
            publisher.Color,
            ImageUrlBuilder.ToUrl(publisher.Image),
            publisher.GetCountryName(),
            publisher.FoundedYear,
            publisher.Website,
            publisher.Description,
            publisher.History);
    }

    public async Task<PublisherDto> CreatePublisherAsync(CreatePublisherRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existingByName = await _unitOfWork.PublisherRepository.GetByNameAsync(name, cancellationToken);
        if (existingByName is not null)
        {
            throw new BusinessConflictException("Ya existe una editorial con el mismo nombre.");
        }

        var country = null as Country;
        if (request.CountryId.HasValue)
        {
            country = await _unitOfWork.CountryRepository.GetByIdAsync(request.CountryId.Value, cancellationToken);
            if (country is null || !country.IsActive)
            {
                throw new BusinessNotFoundException("El país no existe o no está activo.");
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            ValidateHexColor(request.Color);
        }

        Image? avatar = null;
        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            avatar = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "publisher.webp", ImageType.Avatar, cancellationToken);
            await _unitOfWork.ImageRepository.AddAsync(avatar, cancellationToken);
        }

        var publisher = new Publisher
        {
            Name = name,
            Description = request.Description?.Trim(),
            Website = request.Website?.Trim(),
            Country = country,
            FoundedYear = request.FoundedYear,
            History = request.History?.Trim(),
            IsAlive = request.IsAlive,
            Image = avatar,
            Color = request.Color?.Trim(),
            IsFeatured = request.IsFeatured,
            IsActive = true
        };

        try
        {
            await _unitOfWork.PublisherRepository.AddAsync(publisher, cancellationToken);
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

        return ToDto(publisher, country?.Name);
    }

    public async Task<PublisherDto> UpdatePublisherAsync(long publisherId, UpdatePublisherRequest request, CancellationToken cancellationToken = default)
    {
        if (publisherId <= 0)
        {
            throw new ValidationException("El identificador de la editorial es obligatorio.");
        }

        var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(publisherId, cancellationToken);
        if (publisher is null)
        {
            throw new BusinessNotFoundException("La editorial no existe.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var existingByName = await _unitOfWork.PublisherRepository.GetByNameAsync(name, cancellationToken);
        if (existingByName is not null && existingByName.Id != publisherId)
        {
            throw new BusinessConflictException("Ya existe una editorial con el mismo nombre.");
        }

        var country = null as Country;
        if (request.CountryId.HasValue)
        {
            country = await _unitOfWork.CountryRepository.GetByIdAsync(request.CountryId.Value, cancellationToken);
            if (country is null || !country.IsActive)
            {
                throw new BusinessNotFoundException("El país no existe o no está activo.");
            }
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            ValidateHexColor(request.Color);
        }

        publisher.Name = name;
        publisher.Description = request.Description?.Trim();
        publisher.Website = request.Website?.Trim();
        publisher.Country = country;
        publisher.FoundedYear = request.FoundedYear;
        publisher.History = request.History?.Trim();
        publisher.IsAlive = request.IsAlive;
        publisher.Color = request.Color?.Trim();
        publisher.IsFeatured = request.IsFeatured;

        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            var oldImagePath = publisher.Image?.StoragePath;
            var newImage = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "publisher.webp", ImageType.Avatar, cancellationToken);

            try
            {
                publisher.Image = newImage;
                await _unitOfWork.PublisherRepository.UpdateAsync(publisher, cancellationToken);
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
            if (publisher.Image is not null)
            {
                var oldImagePath = publisher.Image.StoragePath;
                publisher.Image = null;
                await _unitOfWork.PublisherRepository.UpdateAsync(publisher, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                if (!string.IsNullOrEmpty(oldImagePath))
                {
                    await _fileStorageService.DeleteAsync(oldImagePath, cancellationToken);
                }
            }
            else
            {
                await _unitOfWork.PublisherRepository.UpdateAsync(publisher, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }
        else
        {
            await _unitOfWork.PublisherRepository.UpdateAsync(publisher, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ToDto(publisher, country?.Name);
    }

    public async Task DeactivatePublisherAsync(long publisherId, CancellationToken cancellationToken = default)
    {
        if (publisherId <= 0)
        {
            throw new ValidationException("El identificador de la editorial es obligatorio.");
        }

        var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(publisherId, cancellationToken);
        if (publisher is null)
        {
            throw new BusinessNotFoundException("La editorial no existe.");
        }

        if (!publisher.IsActive)
        {
            return;
        }

        publisher.IsActive = false;

        await _unitOfWork.PublisherRepository.UpdateAsync(publisher, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivatePublisherAsync(long publisherId, CancellationToken cancellationToken = default)
    {
        if (publisherId <= 0)
        {
            throw new ValidationException("El identificador de la editorial es obligatorio.");
        }

        var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(publisherId, cancellationToken);
        if (publisher is null)
        {
            throw new BusinessNotFoundException("La editorial no existe.");
        }

        if (publisher.IsActive)
        {
            return;
        }

        publisher.IsActive = true;

        await _unitOfWork.PublisherRepository.UpdateAsync(publisher, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdminPublisherDetailDto> GetPublisherDetailAsync(long publisherId, CancellationToken cancellationToken = default)
    {
        if (publisherId <= 0)
        {
            throw new ValidationException("El identificador de la editorial es obligatorio.");
        }

        var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(publisherId, cancellationToken);
        if (publisher is null)
        {
            throw new BusinessNotFoundException("La editorial no existe.");
        }

        return ToDetailDto(publisher);
    }

    private static void ValidateHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color) || !System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$"))
        {
            throw new ValidationException("El color debe ser un valor hexadecimal válido en formato #RRGGBB.");
        }
    }

    private static PublisherDto ToDto(Publisher publisher, string? countryName)
    {
        string? avatarUrl = null;
        if (publisher.Image is not null)
        {
            avatarUrl = $"/images/{publisher.Image.Id}";
        }

        return new PublisherDto(
            publisher.Id,
            publisher.Name,
            publisher.Description,
            publisher.Website,
            publisher.Country != null ? publisher.Country.Id : 0,
            countryName,
            publisher.FoundedYear,
            publisher.History,
            publisher.IsAlive,
            publisher.Image != null ? publisher.Image.Id : 0,
            publisher.Color,
            publisher.IsFeatured,
            publisher.IsActive,
            avatarUrl);
    }

    private static AdminPublisherDetailDto ToDetailDto(Publisher publisher)
    {
        string? avatarUrl = null;
        if (publisher.Image is not null)
        {
            avatarUrl = $"/images/{publisher.Image.Id}";
        }

        return new AdminPublisherDetailDto(
            publisher.Id,
            publisher.Name,
            publisher.Description,
            publisher.Website,
            publisher.Country != null ? publisher.Country.Id : 0,
            publisher.Country != null ? publisher.Country.Name : string.Empty,
            publisher.FoundedYear,
            publisher.History,
            publisher.IsAlive,
            publisher.Image != null ? publisher.Image.Id : 0,
            avatarUrl,
            publisher.Color,
            publisher.IsFeatured,
            publisher.IsActive,
            publisher.CreatedAt);
    }
}
