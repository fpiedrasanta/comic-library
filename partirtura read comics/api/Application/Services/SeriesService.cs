using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class SeriesService : ISeriesService
{
    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;

    public SeriesService(
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork)
    {
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ListResponse<SeriesListItemDto>> GetPagedAsync(GetSeriesRequest request, CancellationToken cancellationToken = default)
    {
        if (request.currentPage < 1) request.currentPage = 1;
        if (request.pageSize < 1) request.pageSize = 12;
        if (request.pageSize > 50) request.pageSize = 50;
        if (string.IsNullOrWhiteSpace(request.orderDir)) request.orderDir = SortDirection.ASC;

        (IReadOnlyList<Series> series, int totalCount) = await _unitOfWork.SeriesRepository.GetPagedAsync(
            request.currentPage, request.pageSize, request.orderBy, request.orderDir,
            request.search, request.PublisherId, request.FranchiseId,
            request.IsActive, request.IsFeatured, request.IsOngoing, cancellationToken);

        var items = series.Select(s =>
        {
            string? urlImage = null;
            if (s.Image is not null)
            {
                urlImage = $"/images/{s.Image.Id}";
            }

            return new SeriesListItemDto(
                s.Id,
                s.Name,
                s.Franchise?.Name,
                s.Franchise?.Publisher?.Name,
                s.Franchise?.Publisher?.Country?.Name,
                s.Image?.Id,
                urlImage,
                s.Color,
                s.IsFeatured,
                s.IsOngoing,
                s.IsActive,
                s.CreatedAt);
        }).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.pageSize);

        return new ListResponse<SeriesListItemDto>(
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

    public async Task<ListResponse<CatalogSeriesCardDto>> GetCatalogPagedAsync(GetCatalogSeriesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);

        var (series, totalCount) = await _unitOfWork.SeriesRepository.GetCatalogPagedAsync(currentPage, pageSize, request.search, request.franchiseId, request.publisherId, cancellationToken);

        var items = series.Select(s => new CatalogSeriesCardDto(
            s.Id,
            s.Name,
            s.Color,
            ImageUrlBuilder.ToUrl(s.Image),
            new CatalogNodeDto(s.Franchise.Id, s.Franchise.Name, s.Franchise.Color),
            new CatalogNodeDto(s.Franchise.Publisher.Id, s.Franchise.Publisher.Name, s.Franchise.Publisher.Color))).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<ListResponse<SeriesFilterDto>> GetPublicPagedAsync(GetPublicSeriesRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.CatalogFilterMaxPageSize, ref currentPage, ref pageSize);

        var (series, totalCount) = await _unitOfWork.SeriesRepository.GetPagedAsync(
            currentPage, pageSize, request.orderBy, request.orderDir, request.search,
            request.PublisherId, request.FranchiseId, true, null, null, cancellationToken);

        var items = series.Select(s => new SeriesFilterDto(
            s.Id,
            s.Name,
            s.Color,
            s.Franchise?.Id,
            s.Franchise?.Name,
            s.Franchise?.Publisher?.Id,
            s.Franchise?.Publisher?.Name)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<PublicSeriesDetailDto> GetPublicDetailAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        if (seriesId <= 0)
        {
            throw new ValidationException("El identificador de la serie es obligatorio.");
        }

        var series = await _unitOfWork.SeriesRepository.GetDetailByIdAsync(seriesId, cancellationToken);

        if (series is null || !series.IsActive)
        {
            throw new BusinessNotFoundException("La serie no existe.");
        }

        PublicSeriesNodeDto? franchise = series.Franchise is null
            ? null
            : new PublicSeriesNodeDto(series.Franchise.Id, series.Franchise.Name, series.Franchise.Color);

        PublicSeriesNodeDto? publisher = series.Franchise?.Publisher is null
            ? null
            : new PublicSeriesNodeDto(
                series.Franchise.Publisher.Id,
                series.Franchise.Publisher.Name,
                series.Franchise.Publisher.Color);

        return new PublicSeriesDetailDto(
            series.Id,
            series.Name,
            series.Description,
            series.Color,
            ImageUrlBuilder.ToUrl(series.Image),
            franchise,
            publisher);
    }

    public async Task<SeriesDetailDto> GetByIdAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        var series = await _unitOfWork.SeriesRepository.GetByIdAsync(seriesId, cancellationToken);
        if (series is null)
        {
            throw new BusinessNotFoundException("La serie no existe.");
        }

        return ToDetailDto(series);
    }

    public async Task<SeriesDetailDto> CreateSeriesAsync(CreateSeriesRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId, cancellationToken);
        if (franchise is null || !franchise.IsActive)
        {
            throw new BusinessNotFoundException("La franquicia no existe o no está activa.");
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            ValidateHexColor(request.Color);
        }

        Image? avatar = null;
        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            avatar = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "series.webp", ImageType.Avatar, cancellationToken);
            await _unitOfWork.ImageRepository.AddAsync(avatar, cancellationToken);
        }

        var series = new Series
        {
            Name = name,
            Description = request.Description?.Trim(),
            Franchise = franchise,
            Image = avatar,
            Color = request.Color?.Trim(),
            IsFeatured = request.IsFeatured,
            IsOngoing = request.IsOngoing,
            IsActive = true
        };

        await _unitOfWork.SeriesRepository.AddAsync(series, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return ToDetailDto(series);
    }

    public async Task<SeriesDetailDto> UpdateSeriesAsync(long seriesId, UpdateSeriesRequest request, CancellationToken cancellationToken = default)
    {
        var series = await _unitOfWork.SeriesRepository.GetByIdAsync(seriesId, cancellationToken);
        if (series is null)
        {
            throw new BusinessNotFoundException("La serie no existe.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("El nombre es obligatorio.");
        }

        var name = request.Name.Trim();

        var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId, cancellationToken);
        if (franchise is null || !franchise.IsActive)
        {
            throw new BusinessNotFoundException("La franquicia no existe o no está activa.");
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            ValidateHexColor(request.Color);
        }

        series.Name = name;
        series.Description = request.Description?.Trim();
        series.Franchise = franchise;
        series.Color = request.Color?.Trim();
        series.IsFeatured = request.IsFeatured;
        series.IsOngoing = request.IsOngoing;

        if (request.AvatarData is not null && request.AvatarData.Length > 0)
        {
            var newImage = await _fileStorageService.SaveAsync(request.AvatarData, request.AvatarFileName ?? "series.webp", ImageType.Avatar, cancellationToken);

            series.Image = newImage;
        }
        else if (request.ImageId == 0)
        {
            series.Image = null;
        }
        
        await _unitOfWork.SeriesRepository.UpdateAsync(series, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ToDetailDto(series);
    }

    public async Task DeactivateSeriesAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        if (seriesId <= 0)
        {
            throw new ValidationException("El identificador de la serie es obligatorio.");
        }

        var series = await _unitOfWork.SeriesRepository.GetByIdAsync(seriesId, cancellationToken);
        if (series is null)
        {
            throw new BusinessNotFoundException("La serie no existe.");
        }

        if (!series.IsActive)
        {
            return;
        }

        series.IsActive = false;
        await _unitOfWork.SeriesRepository.UpdateAsync(series, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateSeriesAsync(long seriesId, CancellationToken cancellationToken = default)
    {
        if (seriesId <= 0)
        {
            throw new ValidationException("El identificador de la serie es obligatorio.");
        }

        var series = await _unitOfWork.SeriesRepository.GetByIdAsync(seriesId, cancellationToken);
        if (series is null)
        {
            throw new BusinessNotFoundException("La serie no existe.");
        }

        if (series.IsActive)
        {
            return;
        }

        series.IsActive = true;
        await _unitOfWork.SeriesRepository.UpdateAsync(series, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color) || !System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$"))
        {
            throw new ValidationException("El color debe ser un valor hexadecimal válido en formato #RRGGBB.");
        }
    }

    private static SeriesDetailDto ToDetailDto(Series series)
    {
        string? urlImage = null;
        if (series.Image is not null)
        {
            urlImage = $"/images/{series.Image.Id}";
        }

        string? franchiseUrlImage = null;
        if (series.Franchise?.Image is not null)
        {
            franchiseUrlImage = $"/images/{series.Franchise.Image.Id}";
        }

        return new SeriesDetailDto(
            series.Id,
            series.Name,
            series.Description,
            series.Franchise?.Id ?? 0,
            series.Franchise?.Name,
            series.Franchise?.Image?.Id,
            franchiseUrlImage,
            series.Franchise?.Color,
            series.Franchise?.IsFeatured ?? false,
            series.Franchise?.IsOngoing ?? false,
            series.Franchise?.IsActive ?? false,
            series.Franchise?.Publisher?.Id,
            series.Franchise?.Publisher?.Name,
            series.Franchise?.Publisher?.Country?.Name,
            series.Image?.Id,
            urlImage,
            series.Color,
            series.IsFeatured,
            series.IsOngoing,
            series.IsActive);
    }
}
