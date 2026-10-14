using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Application.Services;

public class WorkService : IWorkService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<WorkService> _logger;

    public WorkService(IUnitOfWork unitOfWork, IFileStorageService fileStorageService, IBackgroundJobService backgroundJobService, ILogger<WorkService> logger)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    public async Task<ListResponse<WorkListItemDto>> GetPagedAsync(GetWorksRequest request, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;

        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        var orderDir = string.IsNullOrWhiteSpace(request.orderDir) ? SortDirection.ASC : request.orderDir;

        var (items, totalCount) = await _unitOfWork.WorkRepository.GetPagedAsync(
            currentPage,
            pageSize,
            request.orderBy,
            orderDir,
            request.search,
            request.workTypeId,
            request.isActive,
            request.languageId,
            request.contentStatus,
            request.publicationDateFrom,
            request.publicationDateTo,
            request.publisherId,
            request.franchiseId,
            request.seriesId,
            cancellationToken,
             request.iaRequest,
             request.iaStatus,
             request.withDescription);

        var dtos = items.Select(w => MapWork(w)).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, dtos);
    }

    public async Task<ListResponse<WorkCatalogItemDto>> GetCatalogPagedAsync(GetCatalogWorksRequest request, long? userId, CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;

        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        var orderBy = string.IsNullOrWhiteSpace(request.orderBy) ? WorkCatalogSortFields.CreatedAt : request.orderBy;
        var orderDir = string.IsNullOrWhiteSpace(request.orderDir) ? SortDirection.DESC : request.orderDir;

        var (items, totalCount) = await _unitOfWork.WorkRepository.GetCatalogPagedAsync(
            currentPage,
            pageSize,
            orderBy,
            orderDir,
            request.search,
            request.publisherId,
            request.franchiseId,
            request.seriesId,
            request.workTypeId,
            cancellationToken);

        var progressesByWorkId = new Dictionary<long, WorkReadingProgress>();

        if (userId.HasValue && userId.Value > 0 && items.Count > 0)
        {
            var workIds = items.Select(work => work.Id).ToList();
            var progresses = await _unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(workIds, userId.Value, cancellationToken);

            progressesByWorkId = progresses.ToDictionary(progress => progress.Work!.Id);
        }

        var dtos = items.Select(work =>
        {
            progressesByWorkId.TryGetValue(work.Id, out var progress);
            return MapCatalogWork(work, progress);
        }).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, dtos);
    }

    public async Task<CatalogWorkDetailDto> GetCatalogByIdAsync(long id, long? userId, CancellationToken cancellationToken = default)
    {
        var work = await _unitOfWork.WorkRepository.GetCatalogByIdAsync(id, cancellationToken);
        if (work is null)
        {
            throw new BusinessNotFoundException("Work does not exist.");
        }

        var progress = userId.HasValue && userId.Value > 0
            ? await _unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(work.Id, userId.Value, cancellationToken)
            : null;

        return MapCatalogDetail(work, progress);
    }

    private static CatalogWorkDetailDto MapCatalogDetail(Work work, WorkReadingProgress? readingProgress = null)
    {
        return new CatalogWorkDetailDto(
            work.Id,
            MapPublisherContext(work),
            MapFranchiseContext(work),
            MapSeriesContext(work),
            ImageUrlBuilder.ToUrl(work.Cover),
            work.NumberValue,
            work.Title,
            work.Description,
            work.Language is null ? null : new LanguageDto(work.Language.Id, work.Language.Name, work.Language.Code),
            work.WorkType is null ? null : new WorkTypeFilterDto(work.WorkType.Id, work.WorkType.Name),
            work.PublicationDate,
            MapNavigationWork(work.PreviousNumber),
            MapNavigationWork(work.NextNumber),
            work.PersonByRoles.Select(pbr => new PersonByRoleDto(pbr.GetPersonId(), pbr.GetPersonName(), pbr.GetRoleId(), pbr.GetRoleName())).ToList(),
            work.Tags.Select(tw => new TagDto(tw.GetTagId(), tw.GetTagName())).ToList(),
            work.AverageRating,
            work.RatingCount,
            WorkCardMapper.ToProgress(readingProgress));
    }

    private static CatalogWorkContextDto? MapPublisherContext(Work work)
    {
        var publisher = work.Publisher ?? work.Franchise?.Publisher ?? work.Series?.Franchise?.Publisher;
        return publisher is null ? null : new CatalogWorkContextDto(publisher.Id, publisher.Name, publisher.Color, ImageUrlBuilder.ToUrl(publisher.Image));
    }

    private static CatalogWorkContextDto? MapFranchiseContext(Work work)
    {
        var franchise = work.Franchise ?? work.Series?.Franchise;
        return franchise is null ? null : new CatalogWorkContextDto(franchise.Id, franchise.Name, franchise.Color, ImageUrlBuilder.ToUrl(franchise.Image));
    }

    private static CatalogWorkContextDto? MapSeriesContext(Work work)
    {
        return work.Series is null ? null : new CatalogWorkContextDto(work.Series.Id, work.Series.Name, work.Series.Color, ImageUrlBuilder.ToUrl(work.Series.Image));
    }

    private static CatalogWorkNavigationDto? MapNavigationWork(Work? work)
    {
        return work is null ? null : new CatalogWorkNavigationDto(work.Id, work.Title, work.NumberValue, ImageUrlBuilder.ToUrl(work.Cover));
    }

    private static WorkCatalogItemDto MapCatalogWork(Work work, WorkReadingProgress? readingProgress = null)
    {
        return WorkCardMapper.ToCard(work, readingProgress);
    }

    public async Task<WorkDetailDto?> GetByIdAsync(long workId, CancellationToken cancellationToken = default)
    {
        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken);
        if (work is null) return null;

        string? urlCover = ImageUrlBuilder.ToUrl(work.Cover);

        ComicAnalysisResult? iaResult = null;
        if (!string.IsNullOrWhiteSpace(work.IAResult))
        {
            try
            {
                iaResult = JsonSerializer.Deserialize<ComicAnalysisResult>(work.IAResult, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch
            {
                // Si hay error deserializando, devolver null
                iaResult = null;
            }
        }

        return new WorkDetailDto(
            work.Id,
            work.WorkType?.Id ?? 0,
            work.GetWorkTypeName() ?? string.Empty,
            work.Title,
            work.Description,
            work.GetLanguageId(),
            work.GetLanguageName(),
            work.GetCoverId(),
            urlCover,
            work.IsActive,
            work.PublicationDate,
            work.CreatedAt,
            work.ContentStatus,
            work.ContentError,
            work.GetSeriesId(),
            work.GetSeriesName(),
            work.GetFranchiseId(),
            work.GetFranchiseName(),
            work.GetPublisherId(),
            work.GetPublisherName(),
            work.GetPublisherCountryName(),
            work.NumberValue,
            work.PreviousNumber is not null ? new NumberReferenceDto(work.GetPreviousNumberId(), work.GetPreviousNumberValue(), work.GetPreviousNumberTitle()) : null,
            work.NextNumber is not null ? new NumberReferenceDto(work.GetNextNumberId(), work.GetNextNumberValue(), work.GetNextNumberTitle()) : null,
            work.GetFileId(),
            work.GetPagesCount(),
            work.PersonByRoles is not null ? work.PersonByRoles.Select(p => new PersonByRoleDto(p.GetPersonId(), p.GetPersonName(), p.GetRoleId(), p.GetRoleName())).ToList() : null,
            work.Tags is not null ? work.Tags.Select(t => new TagDto(t.GetTagId(), t.GetTagName())).ToList() : null,
            work.IAStatus,
            iaResult,
            work.IARequestedAt);
    }

    public async Task<WorkDetailDto> CreateAsync(CreateWorkRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating work for WorkTypeId={WorkTypeId}, Title={Title}", request.WorkTypeId, request.Title);

        await ValidateCreateRequest(request, cancellationToken);

        var workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(request.WorkTypeId, cancellationToken)
            ?? throw new BusinessNotFoundException("El tipo de obra no existe.");

        var language = await _unitOfWork.LanguageRepository.GetByIdAsync(request.LanguageId, cancellationToken)
            ?? throw new BusinessNotFoundException("El idioma no existe.");

        Image? cover = await GetCoverAsync(request.CoverData, request.CoverFileName, cancellationToken);

        var work = new Work
        {
            WorkType = workType,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Language = language,
            Cover = cover,
            PublicationDate = request.PublicationDate,
            IsActive = true,
            ContentStatus = ContentStatus.Missing,
            NumberValue = request.NumberValue?.Trim(),
            PersonByRoles = new List<PersonByRole>(),
            Tags = new List<TagByWork>()
        };

        if (request.SeriesId.HasValue)
        {
            var series = await _unitOfWork.SeriesRepository.GetByIdAsync(request.SeriesId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("La serie no existe.");
            work.Series = series;
        }

        if (request.FranchiseId.HasValue)
        {
            var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("La franquicia no existe.");
            work.Franchise = franchise;
        }

        if (request.PublisherId.HasValue)
        {
            var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El publisher no existe.");
            work.Publisher = publisher;
        }

        if (request.PreviousNumberId.HasValue)
        {
            var previous = await _unitOfWork.WorkRepository.GetByIdAsync(request.PreviousNumberId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El número anterior no existe.");
            work.PreviousNumber = previous;
        }

        if (request.NextNumberId.HasValue)
        {
            var next = await _unitOfWork.WorkRepository.GetByIdAsync(request.NextNumberId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El número siguiente no existe.");
            work.NextNumber = next;
        }

        await SyncPersonByRolesAsync(request.PersonByRoles, work, cancellationToken);
        await SyncTagsAsync(request.Tags, work, cancellationToken);

        await _unitOfWork.WorkRepository.AddAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} created successfully. WorkTypeId={WorkTypeId}", work.Id, request.WorkTypeId);

        return await GetByIdAsync(work.Id, cancellationToken) ?? throw new BusinessNotFoundException("La obra no fue creada.");
    }

    public async Task<WorkDetailDto> CreateWithContentAsync(CreateWorkWithContentRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating work with content for WorkTypeId={WorkTypeId}, Title={Title}, HasContent={HasContent}",
            request.WorkTypeId, request.Title, request.ContentFileData?.Length > 0);

        ValidateCreateWithContentRequest(request);

        WorkType? workType = null;
        
        if(request.WorkTypeId != null) 
        {
            workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(request.WorkTypeId.Value, cancellationToken);
        }

        var work = new Work
        {
            WorkType = workType,
            Title = request.Title.Trim(),
            IsActive = true,
            ContentStatus = ContentStatus.Missing,
            NumberValue = request.NumberValue?.Trim()
        };

        if (request.LanguageId.HasValue)
        {
            var language = await _unitOfWork.LanguageRepository.GetByIdAsync(request.LanguageId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El idioma no existe.");
            work.Language = language;
        }

        if (request.SeriesId.HasValue)
        {
            var series = await _unitOfWork.SeriesRepository.GetByIdAsync(request.SeriesId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("La serie no existe.");
            work.Series = series;
        }

        if (request.FranchiseId.HasValue)
        {
            var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("La franquicia no existe.");
            work.Franchise = franchise;
        }

        if (request.PublisherId.HasValue)
        {
            var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El publisher no existe.");
            work.Publisher = publisher;
        }

        if (request.PreviousNumberId.HasValue)
        {
            var previous = await _unitOfWork.WorkRepository.GetByIdAsync(request.PreviousNumberId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El número anterior no existe.");
            work.PreviousNumber = previous;
        }

        if (request.NextNumberId.HasValue)
        {
            var next = await _unitOfWork.WorkRepository.GetByIdAsync(request.NextNumberId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El número siguiente no existe.");
            work.NextNumber = next;
        }

        if (request.PersonByRoles is not null)
        {
            await SyncPersonByRolesAsync(request.PersonByRoles, work, cancellationToken);
        }

        if (request.Tags is not null)
        {
            await SyncTagsAsync(request.Tags, work, cancellationToken);
        }

        Image? cover = await GetCoverAsync(request.CoverData, request.CoverFileName, cancellationToken);
        work.Cover = cover;

        await _unitOfWork.WorkRepository.AddAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} created successfully. WorkTypeId={WorkTypeId}", work.Id, request.WorkTypeId);

        if (request.ContentFileData is not null && request.ContentFileData.Length > 0)
        {
            _logger.LogInformation("Uploading CBR content for Work {WorkId}. FileName={FileName}, Size={FileSize} bytes",
                work.Id, request.ContentFileName, request.ContentFileData.Length);
            await UploadContentForWorkAsync(work, request.ContentFileData, request.ContentFileName, cancellationToken);
            _logger.LogInformation("CBR content uploaded for Work {WorkId}. Job enqueued.", work.Id);
        }

        return await GetByIdAsync(work.Id, cancellationToken) ?? throw new BusinessNotFoundException("La obra no fue creada.");
    }

    public async Task<WorkDetailDto> UpdateAsync(long workId, UpdateWorkRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating work {WorkId}", workId);

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        await ValidateUpdateRequest(request, cancellationToken);

        var workType = await _unitOfWork.WorkTypeRepository.GetByIdAsync(request.WorkTypeId, cancellationToken)
            ?? throw new BusinessNotFoundException("El tipo de obra no existe.");

        var language = await _unitOfWork.LanguageRepository.GetByIdAsync(request.LanguageId, cancellationToken)
            ?? throw new BusinessNotFoundException("El idioma no existe.");

        Image? cover = await GetCoverAsync(request.CoverData, request.CoverFileName, cancellationToken);

        work.WorkType = workType;
        work.Title = request.Title.Trim();
        work.Description = request.Description?.Trim();
        work.Language = language;
        work.Cover = cover ?? work.Cover;
        work.PublicationDate = request.PublicationDate;
        work.NumberValue = request.NumberValue?.Trim();

        if (request.SeriesId.HasValue)
        {
            var series = await _unitOfWork.SeriesRepository.GetByIdAsync(request.SeriesId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("La serie no existe.");
            work.Series = series;
        }
        else
        {
            work.Series = null;
        }

        if (request.FranchiseId.HasValue)
        {
            var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("La franquicia no existe.");
            work.Franchise = franchise;
        }
        else
        {
            work.Franchise = null;
        }

        if (request.PublisherId.HasValue)
        {
            var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El publisher no existe.");
            work.Publisher = publisher;
        }
        else
        {
            work.Publisher = null;
        }

        if (request.PreviousNumberId.HasValue)
        {
            var previous = await _unitOfWork.WorkRepository.GetByIdAsync(request.PreviousNumberId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El número anterior no existe.");
            work.PreviousNumber = previous;
            previous.NextNumber = work;
            await this._unitOfWork.WorkRepository.UpdateAsync(previous);
        }
        else
        {
            if(work.PreviousNumber != null)
            {
                var n = work.PreviousNumber.Id;
                work.PreviousNumber.NextNumber = null;
                await this._unitOfWork.WorkRepository.UpdateAsync(work.PreviousNumber);
            }
            work.PreviousNumber = null;
        }

        if (request.NextNumberId.HasValue)
        {
            var next = await _unitOfWork.WorkRepository.GetByIdAsync(request.NextNumberId.Value, cancellationToken)
                ?? throw new BusinessNotFoundException("El número siguiente no existe.");
            work.NextNumber = next;
            next.PreviousNumber = work;
            await this._unitOfWork.WorkRepository.UpdateAsync(next);
        }
        else
        {
            if(work.NextNumber != null)
            {
                var n = work.NextNumber.Id;
                work.NextNumber.PreviousNumber = null;
                await this._unitOfWork.WorkRepository.UpdateAsync(work.NextNumber);
            }
            work.NextNumber = null;
        }

        await SyncPersonByRolesAsync(request.PersonByRoles, work, cancellationToken);
        await SyncTagsAsync(request.Tags, work, cancellationToken);

        await _unitOfWork.WorkRepository.UpdateAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} updated successfully", workId);

        return await GetByIdAsync(work.Id, cancellationToken) ?? throw new BusinessNotFoundException("La obra no fue actualizada.");
    }

    public async Task DeactivateAsync(long workId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        if (!work.IsActive) return;

        work.IsActive = false;
        await _unitOfWork.WorkRepository.UpdateAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} deactivated", workId);
    }

    public async Task ActivateAsync(long workId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        if (work.IsActive) return;

        work.IsActive = true;
        await _unitOfWork.WorkRepository.UpdateAsync(work, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} activated", workId);
    }

    private static WorkListItemDto MapWork(Work work)
    {
        TimeSpan? since = null;
        if (work.IARequestedAt.HasValue)
        {
            since = DateTimeOffset.UtcNow - work.IARequestedAt.Value;
        }

        return new WorkListItemDto(
            Id: work.Id,
            Title: work.Title,
            Description: work.Description,
            LanguageId: work.GetLanguageId(),
            LanguageName: work.GetLanguageName(),
            CoverId: work.GetCoverId(),
            UrlCover: ImageUrlBuilder.ToUrl(work.Cover),
            IsActive: work.IsActive,
            PublicationDate: work.PublicationDate,
            CreatedAt: work.CreatedAt,
            ContentStatus: work.ContentStatus,
            ContentError: work.ContentError,
            WorkType: work.GetWorkTypeName() ?? string.Empty,
            SeriesId: work.GetSeriesId(),
            SeriesName: work.GetSeriesName(),
            FranchiseId: work.GetFranchiseId(),
            FranchiseName: work.GetFranchiseName(),
            PublisherId: work.GetPublisherId(),
            PublisherName: work.GetPublisherName(),
            NumberValue: work.NumberValue,
            PreviousNumberValue: work.GetPreviousNumberValue(),
            NextNumberValue: work.GetNextNumberValue(),
            IARequest: work.IARequest,
            IAStatus: work.IAStatus,
            IARequestedAt: work.IARequestedAt,
            Since: since);
    }

    private async Task SyncPersonByRolesAsync(IReadOnlyList<PersonByRoleRequest> personByRoles, Work work, CancellationToken cancellationToken)
    {
        var existing = work.PersonByRoles.ToList();
        foreach (var item in existing)
        {
            work.PersonByRoles.Remove(item);
        }

        foreach (var req in personByRoles)
        {
            var person = await _unitOfWork.PersonRepository.GetByIdAsync(req.PersonId, cancellationToken)
                ?? throw new BusinessNotFoundException($"La persona {req.PersonId} no existe.");

            var role = await _unitOfWork.RoleRepository.GetByIdAsync(req.RoleId, cancellationToken)
                ?? throw new BusinessNotFoundException($"El rol {req.RoleId} no existe.");

            work.PersonByRoles.Add(new PersonByRole
            {
                Work = work,
                Person = person,
                Role = role
            });
        }
    }

    private async Task SyncTagsAsync(IReadOnlyList<TagRequest> tags, Work work, CancellationToken cancellationToken)
    {
        var existing = work.Tags.ToList();
        foreach (var item in existing)
        {
            work.Tags.Remove(item);
        }

        foreach (var tagRequest in tags)
        {
            Tag? tag = null;
            if (tagRequest.Id > 0)
            {
                tag = await _unitOfWork.TagRepository.GetByIdAsync(tagRequest.Id, cancellationToken);
            }
            else
            {
                tag = await _unitOfWork.TagRepository.GetByNameAsync(tagRequest.Name, cancellationToken);
            }

            if (tag == null)
            {
                tag = new Tag
                {
                    CreatedAt = DateTime.UtcNow,
                    Name = tagRequest.Name.Trim()
                };
                await _unitOfWork.TagRepository.AddAsync(tag, cancellationToken);
            }

            work.Tags.Add(new TagByWork
            {
                Work = work,
                Tag = tag
            });
        }
    }

    private async Task<Image?> GetCoverAsync(byte[]? coverData, string? coverFileName, CancellationToken cancellationToken)
    {
        Image? cover = null;
        if (coverData is not null && coverData.Length > 0)
        {
            cover = await _fileStorageService.SaveAsync(
                coverData,
                string.IsNullOrWhiteSpace(coverFileName) ? "cover.webp" : coverFileName.Trim(),
                ImageType.Cover,
                cancellationToken);
            await _unitOfWork.ImageRepository.AddAsync(cover);
        }
        return cover;
    }

    private async Task ValidateCreateRequest(CreateWorkRequest request, CancellationToken cancellationToken)
    {
        if (request.PublicationDate.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("La fecha debe estar en UTC.");
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ValidationException("El título es obligatorio.");
        }

        var hierarchyCount = 0;
        if (request.PublisherId.HasValue) hierarchyCount++;
        if (request.FranchiseId.HasValue) hierarchyCount++;
        if (request.SeriesId.HasValue) hierarchyCount++;

        if (hierarchyCount == 0)
        {
            throw new ValidationException("La obra debe depender de un Publisher, Franchise o Series.");
        }

        if (hierarchyCount > 1)
        {
            throw new ValidationException("La obra no puede depender de más de un nivel de jerarquía.");
        }

        if (request.SeriesId.HasValue)
        {
            var series = await _unitOfWork.SeriesRepository.GetByIdAsync(request.SeriesId.Value, cancellationToken);
            if (series is null || !series.IsActive)
            {
                throw new BusinessNotFoundException("La serie no existe o no está activa.");
            }
        }

        if (request.FranchiseId.HasValue)
        {
            var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId.Value, cancellationToken);
            if (franchise is null || !franchise.IsActive)
            {
                throw new BusinessNotFoundException("La franquicia no existe o no está activa.");
            }
        }

        if (request.PublisherId.HasValue)
        {
            var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId.Value, cancellationToken);
            if (publisher is null || !publisher.IsActive)
            {
                throw new BusinessNotFoundException("El publisher no existe o no está activo.");
            }
        }
    }

    private async Task ValidateUpdateRequest(UpdateWorkRequest request, CancellationToken cancellationToken)
    {
        if (request.PublicationDate.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("La fecha debe estar en UTC.");
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ValidationException("El título es obligatorio.");
        }

        var hierarchyCount = 0;
        if (request.PublisherId.HasValue) hierarchyCount++;
        if (request.FranchiseId.HasValue) hierarchyCount++;
        if (request.SeriesId.HasValue) hierarchyCount++;

        if (hierarchyCount == 0)
        {
            throw new ValidationException("La obra debe depender de un Publisher, Franchise o Series.");
        }

        if (hierarchyCount > 1)
        {
            throw new ValidationException("La obra no puede depender de más de un nivel de jerarquía.");
        }

        if (request.SeriesId.HasValue)
        {
            var series = await _unitOfWork.SeriesRepository.GetByIdAsync(request.SeriesId.Value, cancellationToken);
            if (series is null || !series.IsActive)
            {
                throw new BusinessNotFoundException("La serie no existe o no está activa.");
            }
        }

        if (request.FranchiseId.HasValue)
        {
            var franchise = await _unitOfWork.FranchiseRepository.GetByIdAsync(request.FranchiseId.Value, cancellationToken);
            if (franchise is null || !franchise.IsActive)
            {
                throw new BusinessNotFoundException("La franquicia no existe o no está activa.");
            }
        }

        if (request.PublisherId.HasValue)
        {
            var publisher = await _unitOfWork.PublisherRepository.GetByIdAsync(request.PublisherId.Value, cancellationToken);
            if (publisher is null || !publisher.IsActive)
            {
                throw new BusinessNotFoundException("El publisher no existe o no está activo.");
            }
        }
    }

    private static void ValidateCreateWithContentRequest(CreateWorkWithContentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ValidationException("El título es obligatorio.");
        }

        var hierarchyCount = 0;
        if (request.PublisherId.HasValue) hierarchyCount++;
        if (request.FranchiseId.HasValue) hierarchyCount++;
        if (request.SeriesId.HasValue) hierarchyCount++;

        if (hierarchyCount == 0)
        {
            throw new ValidationException("La obra debe depender de un Publisher, Franchise o Series.");
        }

        if (hierarchyCount > 1)
        {
            throw new ValidationException("La obra no puede depender de más de un nivel de jerarquía.");
        }
    }

    private async Task UploadContentForWorkAsync(Work work, byte[] fileData, string? fileName, CancellationToken cancellationToken)
    {
        var tempFolder = Path.Combine("Storage", "Temp", work.Id.ToString());
        var cbrFilePath = await _fileStorageService.SaveFileAsync(fileData, fileName ?? "content.cbr", tempFolder, cancellationToken);

        _logger.LogInformation("Saving CBR file for Work {WorkId} to {FilePath}. Enqueuing background job.", work.Id, cbrFilePath);
        var jobId = _backgroundJobService.EnqueueCbrProcessing(work.Id, cbrFilePath);
        _logger.LogInformation("CBR processing job enqueued for Work {WorkId}. JobId={JobId}", work.Id, jobId);
    }

    public async Task EnqueueWorkAnalysisAsync(long workId, IReadOnlyList<long> imageIds, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (imageIds is null || imageIds.Count == 0)
        {
            throw new ValidationException("Debe seleccionar al menos una imagen para analizar.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        // Verificar que no exista un procesamiento activo
        if (work.IARequest && (work.IAStatus == IAProcessingStatus.Pending || work.IAStatus == IAProcessingStatus.Processing))
        {
            throw new ValidationException("Ya existe un análisis en curso o pendiente para esta obra.");
        }

        if (work.ContentStatus != ContentStatus.Completed)
        {
            throw new ValidationException("La obra debe estar en estado Completed para analizar su contenido.");
        }

        var pages = work.Pages.OrderBy(p => p.Order).ToList();
        var selectedPages = pages.Where(p => p.Image is not null && imageIds.Contains(p.Image.Id)).ToList();

        if (selectedPages.Count != imageIds.Count)
        {
            throw new BusinessNotFoundException("Una o más imágenes no pertenecen al contenido de la obra.");
        }

        // Verificar que los archivos físicos existan
        foreach (var page in selectedPages)
        {
            var image = page.Image!;
            var physicalPath = _fileStorageService.GetPhysicalPath(image.StoragePath);
            if (!System.IO.File.Exists(physicalPath))
            {
                throw new BusinessNotFoundException($"El archivo físico de la imagen {image.Id} no existe.");
            }
        }

        // Registrar solicitud con estado Pending
        work.IARequest = true;
        work.IAStatus = IAProcessingStatus.Pending;
        work.IAResult = null;
        work.IARequestedAt = DateTimeOffset.UtcNow;

        await _unitOfWork.WorkRepository.UpdateAsync(work);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Encolar Job Hangfire
        var jobId = _backgroundJobService.EnqueueWorkAnalysis(workId, imageIds);

        _logger.LogInformation("AI analysis enqueued for Work {WorkId} with {ImageCount} images. JobId={JobId}", workId, imageIds.Count, jobId);
    }

    public async Task<ReaderWorkPagesDto> GetReaderPagesAsync(long workId, long? userId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdWithNavigationAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        if (!work.IsActive)
        {
            throw new BusinessNotFoundException("La obra no existe.");
        }

        var pages = await _unitOfWork.PageRepository.GetByWorkIdAsync(workId, cancellationToken);

        var previousWork = work.PreviousNumber is not null
            ? new ReaderWorkNavigationDto(work.PreviousNumber.Id, work.PreviousNumber.Title, work.PreviousNumber.NumberValue)
            : null;

        var nextWork = work.NextNumber is not null
            ? new ReaderWorkNavigationDto(work.NextNumber.Id, work.NextNumber.Title, work.NextNumber.NumberValue)
            : null;

        var pageDtos = pages
            .Select(p => new ReaderPageDto(
                p.Id,
                p.Order,
                ImageUrlBuilder.ToUrl(p.Image) ?? string.Empty))
            .ToList();

        int? currentPage = null;
        ReaderMyRatingDto? myRating = null;
        if (userId.HasValue && userId.Value > 0)
        {
            var progress = await _unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId.Value, cancellationToken);
            currentPage = progress?.CurrentPage;

            var rating = await _unitOfWork.WorkRatingRepository.GetByUserIdAndWorkIdAsync(userId.Value, workId, cancellationToken);
            if (rating is not null)
            {
                myRating = new ReaderMyRatingDto(rating.Stars, rating.Review);
            }
        }

        return new ReaderWorkPagesDto(work.Id, previousWork, nextWork, pageDtos, currentPage, myRating);
    }

    public async Task UpdateReadingProgressAsync(long workId, long userId, int currentPage, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (userId <= 0)
        {
            throw new ValidationException("El identificador del usuario es obligatorio.");
        }

        if (currentPage < 1)
        {
            throw new ValidationException("La página actual debe ser mayor o igual a 1.");
        }

        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
            ?? throw new BusinessNotFoundException("La obra no existe.");

        if (!work.IsActive)
        {
            throw new BusinessNotFoundException("La obra no existe.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new BusinessNotFoundException("El usuario no existe.");

        var progress = await _unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, cancellationToken);

        if (progress is null)
        {
            var totalPages = work.Pages?.Count ?? 0;
            
            progress = new WorkReadingProgress
            {
                Work = work,
                User = user,
                CurrentPage = 0,
                TotalPages = totalPages,
                PercentageReading = 0,
                LastReadAt = DateTimeOffset.UtcNow,
                State = ReadingState.Reading
            };
            await _unitOfWork.WorkReadingProgressRepository.AddAsync(progress, cancellationToken);
        }

        var maxValidPosition = progress.TotalPages + 1;

        if (currentPage > maxValidPosition)
        {
            currentPage = maxValidPosition;
        }

        progress.CurrentPage = currentPage;
        progress.PercentageReading = progress.TotalPages == 0
            ? 0
            : (int)((currentPage - 1) * 100 / progress.TotalPages);
        progress.LastReadAt = DateTimeOffset.UtcNow;
        progress.State = currentPage >= maxValidPosition ? ReadingState.Completed : ReadingState.Reading;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<int?> GetCurrentPageAsync(long workId, long userId, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("El identificador de la obra es obligatorio.");
        }

        if (userId <= 0)
        {
            throw new ValidationException("El identificador del usuario es obligatorio.");
        }

        var progress = await _unitOfWork.WorkReadingProgressRepository.GetByWorkIdAndUserIdAsync(workId, userId, cancellationToken);
        return progress?.CurrentPage;
    }
}