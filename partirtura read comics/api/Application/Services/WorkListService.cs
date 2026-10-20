using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class WorkListService : IWorkListService
{
    private const int MinimumPosition = 0;
    private const string NameOrder = "name";
    private const string CreatedAtOrder = "createdat";
    private const string WorkListNotFound = "Work list does not exist.";
    private const string ListTypeNotFound = "List type does not exist or is inactive.";
    private const string WorkNotFound = "Work does not exist.";
    private const string DuplicateWork = "A work cannot appear more than once in the same list.";
    private const string DuplicatePosition = "Each work position must be unique within a list.";

    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WorkListService> _logger;

    public WorkListService(
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        ILogger<WorkListService> logger)
    {
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ListResponse<WorkListListItemDto>> GetPagedAsync(
        GetWorkListsRequest request,
        CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);
        ValidateDateRange(request.createdAtFrom, request.createdAtTo);
        ValidateOrdering(request.orderBy, request.orderDir);

        var (workLists, totalCount) = await _unitOfWork.WorkListRepository.GetPagedAsync(
            currentPage,
            pageSize,
            request.search,
            request.isActive,
            request.franchiseId,
            request.publisherId,
            request.listTypeId,
            request.createdAtFrom,
            request.createdAtTo,
            request.orderBy,
            request.orderDir,
            cancellationToken);

        var items = workLists.Select(ToListItemDto).ToList();
        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    public async Task<WorkListDetailDto> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(id, cancellationToken);
        return workList is null || workList.OwnerType != OwnerType.System
            ? throw new BusinessNotFoundException(WorkListNotFound)
            : ToDetailDto(workList);
    }

    public async Task<WorkListDetailDto> CreateAsync(
        CreateWorkListRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = RequireName(request.Name);
        ValidateColor(request.Color);
        ValidateWorkItems(request.Works);
        var listType = await GetActiveListTypeAsync(request.ListTypeId, cancellationToken);
        await EnsureNameAvailableAsync(name, null, cancellationToken);
        var works = await ResolveWorksAsync(request.Works, cancellationToken);
        var cover = await SaveCoverAsync(request.CoverData, request.CoverFileName, cancellationToken);

        await _unitOfWork.BeginTransAsync(cancellationToken);
        try
        {
            var workList = BuildWorkList(name, request, listType, cover, works);
            await _unitOfWork.WorkListRepository.AddAsync(workList, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
            _logger.LogInformation("Work list {WorkListId} created", workList.Id);
            return ToDetailDto(workList);
        }
        catch
        {
            await DeleteCoverAsync(cover, cancellationToken);
            throw;
        }
    }

    public async Task<WorkListDetailDto> UpdateAsync(
        long id,
        UpdateWorkListRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = RequireName(request.Name);
        ValidateColor(request.Color);
        ValidateWorkItems(request.Works);
        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(id, cancellationToken);
        if (workList is null)
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        var listType = await GetActiveListTypeAsync(request.ListTypeId, cancellationToken);
        await EnsureNameAvailableAsync(name, id, cancellationToken);
        var works = await ResolveWorksAsync(request.Works, cancellationToken);
        var cover = await SaveCoverAsync(request.CoverData, request.CoverFileName, cancellationToken);
        var oldCoverPath = cover is null ? GetCoverPathForReplacement(workList, request.CoverImageId) : workList.Cover?.StoragePath;

        await _unitOfWork.BeginTransAsync(cancellationToken);
        try
        {
            ApplyCover(workList, request.CoverImageId, cover);
            ApplyWorkListData(workList, name, request, listType, works);
            await _unitOfWork.WorkListRepository.UpdateAsync(workList, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
            await DeleteCoverPathAsync(oldCoverPath, cancellationToken);
            _logger.LogInformation("Work list {WorkListId} updated", workList.Id);
            return ToDetailDto(workList);
        }
        catch
        {
            await DeleteCoverAsync(cover, cancellationToken);
            throw;
        }
    }

    public async Task SetCurrentWorkAsync(long workListId, long userId, long workId, CancellationToken cancellationToken = default)
    {
        if (workListId <= 0)
        {
            throw new ValidationException("Work list identifier is required.");
        }

        if (userId <= 0)
        {
            throw new ValidationException("User identifier is required.");
        }

        if (workId <= 0)
        {
            throw new ValidationException("Work identifier is required.");
        }

        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(workListId, cancellationToken);
        if (workList is null || !workList.IsActive)
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        if (workList.OwnerType == OwnerType.User && (workList.Owner is null || workList.Owner.Id != userId))
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        if (!workList.WorkListItems.Any(workItem => workItem.Work.Id == workId))
        {
            throw new BusinessNotFoundException("The work does not belong to the list.");
        }

        await _unitOfWork.BeginTransAsync(cancellationToken);
        try
        {
            var listProgress = await _unitOfWork.ListReadingProgressRepository
                .GetByUserIdAndWorkListIdAsync(userId, workListId, cancellationToken);

            Domain.Entities.ListReadingProgress progress;
            if (listProgress is null)
            {
                var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken)
                           ?? throw new BusinessNotFoundException("The user does not exist.");
                var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken)
                           ?? throw new BusinessNotFoundException(WorkNotFound);

                progress = new Domain.Entities.ListReadingProgress
                {
                    User = user,
                    WorkList = workList,
                    CurrentWork = work,
                    LastReadAt = DateTimeOffset.UtcNow
                };
                await _unitOfWork.ListReadingProgressRepository.AddAsync(progress, cancellationToken);
            }
            else
            {
                await _unitOfWork.ListReadingProgressRepository.UpdateAsync(listProgress, workId, cancellationToken);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            _logger.LogInformation("Current work set to {CurrentWorkId} for list {WorkListId} by user {UserId}.", workId, workListId, userId);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<WorkList> GetActiveWorkListAsync(long workListId, CancellationToken cancellationToken)
    {
        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(workListId, cancellationToken);
        if (workList is null || !workList.IsActive)
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        return workList;
    }

    public async Task DeactivateAsync(long id, CancellationToken cancellationToken = default)
    {
        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(id, cancellationToken);
        if (workList is null || workList.OwnerType != OwnerType.System)
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        if (!workList.IsActive)
        {
            return;
        }

        workList.IsActive = false;
        await _unitOfWork.WorkListRepository.UpdateAsync(workList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ActivateAsync(long id, CancellationToken cancellationToken = default)
    {
        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(id, cancellationToken);
        if (workList is null || workList.OwnerType != OwnerType.System)
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        if (workList.IsActive)
        {
            return;
        }

        workList.IsActive = true;
        await _unitOfWork.WorkListRepository.UpdateAsync(workList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<ListResponse<CatalogListCardDto>> GetCatalogPagedAsync(
        GetCatalogListsRequest request,
        long? userId = null,
        CancellationToken cancellationToken = default)
    {
        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.CatalogCardDefaultPageSize, PaginationGuard.CatalogCardMaxPageSize, ref currentPage, ref pageSize);
        ValidateOrdering(request.orderBy, request.orderDir);

        var (workLists, totalCount) = await _unitOfWork.WorkListRepository.GetCatalogPagedAsync(
            userId,
            currentPage,
            pageSize,
            request.search,
            request.publisherId,
            request.franchiseId,
            request.seriesId,
            request.listTypeId,
            request.orderBy,
            request.orderDir,
            cancellationToken,
            IsMyListsRequest(request.myLists));

        var items = workLists.Select(ToCatalogCardDto).ToList();
        return PaginationGuard.Build(currentPage, pageSize, totalCount, items);
    }

    /// <summary>
    /// Only the literal value "true" enables the personal lists query. Any other value (false, omitted,
    /// empty or not recognized) keeps the system lists query, without producing a binding error.
    /// </summary>
    private static bool IsMyListsRequest(string? myLists)
    {
        return string.Equals(myLists?.Trim(), "true", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<CatalogListDetailDto> GetCatalogByIdAsync(long id, long? userId = null, CancellationToken cancellationToken = default)
    {
        var workList = await _unitOfWork.WorkListRepository.GetCatalogByIdAsync(id, cancellationToken, userId);
        if (workList is null)
        {
            throw new BusinessNotFoundException(WorkListNotFound);
        }

        var progressByWorkId = await GetReadingProgressByWorkIdAsync(workList, userId, cancellationToken);
        var currentWorkId = await ResolveCurrentWorkIdAsync(workList, userId, cancellationToken);
        return ToCatalogDetailDto(workList, progressByWorkId, currentWorkId);
    }

    private async Task<long?> ResolveCurrentWorkIdAsync(
        WorkList workList,
        long? userId,
        CancellationToken cancellationToken)
    {
        if (userId is null || userId.Value <= 0)
        {
            return null;
        }

        var listProgress = await _unitOfWork.ListReadingProgressRepository
            .GetByUserIdAndWorkListIdAsync(userId.Value, workList.Id, cancellationToken);

        var currentWork = listProgress?.CurrentWork;
        var validWorkIds = workList.WorkListItems.Select(workItem => workItem.Work.Id).ToHashSet();

        if (currentWork is not null && validWorkIds.Contains(currentWork.Id))
        {
            return currentWork.Id;
        }

        var firstWork = workList.WorkListItems
            .OrderBy(workItem => workItem.Position)
            .Select(workItem => workItem.Work)
            .FirstOrDefault();

        return firstWork?.Id;
    }

    private async Task<Dictionary<long, WorkReadingProgress>> GetReadingProgressByWorkIdAsync(
        WorkList workList,
        long? userId,
        CancellationToken cancellationToken)
    {
        if (userId is null || userId.Value <= 0)
        {
            return new Dictionary<long, WorkReadingProgress>();
        }

        var workIds = workList.WorkListItems.Select(workItem => workItem.Work.Id).ToList();
        var progressRecords = await _unitOfWork.WorkReadingProgressRepository
            .GetByWorkIdsAndUserIdAsync(workIds, userId.Value, cancellationToken);

        return progressRecords.ToDictionary(progress => progress.Work!.Id);
    }

    private async Task<ListType> GetActiveListTypeAsync(long listTypeId, CancellationToken cancellationToken)
    {
        var listType = await _unitOfWork.ListTypeRepository.GetByIdAsync(listTypeId, cancellationToken);
        return listType is null || !listType.IsActive
            ? throw new BusinessNotFoundException(ListTypeNotFound)
            : listType;
    }

    private async Task EnsureNameAvailableAsync(
        string name,
        long? currentWorkListId,
        CancellationToken cancellationToken)
    {
        var existing = await _unitOfWork.WorkListRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != currentWorkListId)
        {
            throw new BusinessConflictException("A work list with the same name already exists.");
        }
    }

    private async Task<IReadOnlyList<Work>> ResolveWorksAsync(
        IReadOnlyList<WorkListWorkItemRequest> workItems,
        CancellationToken cancellationToken)
    {
        var works = new List<Work>(workItems.Count);
        foreach (var workItem in workItems)
        {
            var work = await _unitOfWork.WorkRepository.GetByIdAsync(workItem.WorkId, cancellationToken);
            if (work is null)
            {
                throw new BusinessNotFoundException($"{WorkNotFound} Id: {workItem.WorkId}");
            }

            works.Add(work);
        }

        return works;
    }

    private static void ValidateWorkItems(IReadOnlyList<WorkListWorkItemRequest> workItems)
    {
        if (workItems.Count == 0)
        {
            return;
        }

        var workIds = workItems.Select(workItem => workItem.WorkId).ToList();
        if (workIds.Distinct().Count() != workIds.Count)
        {
            throw new BusinessConflictException(DuplicateWork);
        }

        var positions = workItems.Select(workItem => workItem.Position).ToList();
        if (positions.Distinct().Count() != positions.Count)
        {
            throw new BusinessConflictException(DuplicatePosition);
        }

        foreach (var workItem in workItems)
        {
            if (workItem.WorkId <= 0 || workItem.Position < MinimumPosition)
            {
                throw new ValidationException("Work ids must be positive and positions must be non-negative.");
            }
        }
    }

    private static string RequireName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("Work list name is required.");
        }

        return name.Trim();
    }

    private static void ValidateColor(string? color)
    {
        if (!string.IsNullOrWhiteSpace(color) && !ColorValidator.IsValidHex(color))
        {
            throw new ValidationException("Color must use #RRGGBB hexadecimal format.");
        }
    }

    private static void ValidateDateRange(DateTime? createdAtFrom, DateTime? createdAtTo)
    {
        if (createdAtFrom.HasValue && createdAtFrom.Value.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("CreatedAtFrom must be in UTC.");
        }

        if (createdAtTo.HasValue && createdAtTo.Value.Kind != DateTimeKind.Utc)
        {
            throw new ValidationException("CreatedAtTo must be in UTC.");
        }

        if (createdAtFrom.HasValue && createdAtTo.HasValue && createdAtFrom.Value > createdAtTo.Value)
        {
            throw new ValidationException("CreatedAtFrom cannot be later than CreatedAtTo.");
        }
    }

    private static void ValidateOrdering(string? orderBy, string? orderDir)
    {
        var direction = string.IsNullOrWhiteSpace(orderDir) ? SortDirection.ASC : orderDir;
        if (!string.IsNullOrWhiteSpace(orderBy) &&
            !orderBy.Equals(NameOrder, StringComparison.OrdinalIgnoreCase) &&
            !orderBy.Equals(CreatedAtOrder, StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("orderBy must be Name or CreatedAt.");
        }

        if (!direction.Equals(SortDirection.ASC, StringComparison.OrdinalIgnoreCase) &&
            !direction.Equals(SortDirection.DESC, StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException("orderDir must be ASC or DESC.");
        }
    }

    private static WorkList BuildWorkList(
        string name,
        CreateWorkListRequest request,
        ListType listType,
        Image? cover,
        IReadOnlyList<Work> works)
    {
        var workList = new WorkList
        {
            Name = name,
            Description = request.Description?.Trim(),
            Cover = cover,
            Color = request.Color?.Trim(),
            ListType = listType,
            OwnerType = OwnerType.System,
            Owner = null,
            Visibility = request.Visibility,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        workList.WorkListItems = request.Works
            .Zip(works, (workItem, work) => new WorkListItem
            {
                Work = work,
                Position = workItem.Position
            })
            .OrderBy(workItem => workItem.Position)
            .ToList();
        return workList;
    }

    private async Task<Image?> SaveCoverAsync(
        byte[]? coverData,
        string? coverFileName,
        CancellationToken cancellationToken)
    {
        if (coverData is null || coverData.Length == 0)
        {
            return null;
        }

        var cover = await _fileStorageService.SaveAsync(
            coverData,
            string.IsNullOrWhiteSpace(coverFileName) ? "work-list-cover.webp" : coverFileName.Trim(),
            ImageType.Cover,
            cancellationToken);
        await _unitOfWork.ImageRepository.AddAsync(cover, cancellationToken);
        return cover;
    }

    private static string? GetCoverPathForReplacement(WorkList workList, long? coverImageId)
    {
        return coverImageId == 0 ? workList.Cover?.StoragePath : null;
    }

    private static void ApplyCover(WorkList workList, long? coverImageId, Image? cover)
    {
        if (cover is not null)
        {
            workList.Cover = cover;
            return;
        }

        if (coverImageId == 0)
        {
            workList.Cover = null;
        }
    }

    private static void ApplyWorkListData(
        WorkList workList,
        string name,
        UpdateWorkListRequest request,
        ListType listType,
        IReadOnlyList<Work> works)
    {
        workList.Name = name;
        workList.Description = request.Description?.Trim();
        workList.Color = request.Color?.Trim();
        workList.ListType = listType;
        workList.Visibility = request.Visibility;
        ReplaceWorkItems(workList, request.Works, works);
    }

    private static void ReplaceWorkItems(
        WorkList workList,
        IReadOnlyList<WorkListWorkItemRequest> requestedWorks,
        IReadOnlyList<Work> works)
    {
        RemoveMissingWorkItems(workList, requestedWorks);
        UpdateExistingPositions(workList, requestedWorks);
        AddMissingWorkItems(workList, requestedWorks, works);
        workList.WorkListItems = workList.WorkListItems.OrderBy(workItem => workItem.Position).ToList();
    }

    private static void RemoveMissingWorkItems(
        WorkList workList,
        IReadOnlyList<WorkListWorkItemRequest> requestedWorks)
    {
        var requestedIds = requestedWorks.Select(workItem => workItem.WorkId).ToHashSet();
        foreach (var item in workList.WorkListItems.Where(workItem => !requestedIds.Contains(workItem.Work.Id)).ToList())
        {
            workList.WorkListItems.Remove(item);
        }
    }

    private static void UpdateExistingPositions(
        WorkList workList,
        IReadOnlyList<WorkListWorkItemRequest> requestedWorks)
    {
        const int TempPositionOffset = -1000000;

        foreach (var requestedWork in requestedWorks)
        {
            var item = workList.WorkListItems.FirstOrDefault(workItem => workItem.Work.Id == requestedWork.WorkId);
            if (item is not null)
            {
                item.Position = TempPositionOffset + requestedWork.Position;
            }
        }

        foreach (var requestedWork in requestedWorks)
        {
            var item = workList.WorkListItems.FirstOrDefault(workItem => workItem.Work.Id == requestedWork.WorkId);
            if (item is not null)
            {
                item.Position = requestedWork.Position;
            }
        }
    }

    private static void AddMissingWorkItems(
        WorkList workList,
        IReadOnlyList<WorkListWorkItemRequest> requestedWorks,
        IReadOnlyList<Work> works)
    {
        var existingIds = workList.WorkListItems.Select(workItem => workItem.Work.Id).ToHashSet();
        foreach (var requestedWork in requestedWorks)
        {
            if (existingIds.Contains(requestedWork.WorkId))
            {
                continue;
            }

            var work = works.First(workItem => workItem.Id == requestedWork.WorkId);
            workList.WorkListItems.Add(new WorkListItem
            {
                Work = work,
                Position = requestedWork.Position
            });
        }
    }

    private async Task DeleteCoverAsync(Image? cover, CancellationToken cancellationToken)
    {
        if (cover is null)
        {
            return;
        }

        await _fileStorageService.DeleteAsync(cover.StoragePath, cancellationToken);
    }

    private async Task DeleteCoverPathAsync(string? storagePath, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            return;
        }

        try
        {
            await _fileStorageService.DeleteAsync(storagePath, cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Failed to delete replaced work list cover {StoragePath}", storagePath);
        }
    }

    private static WorkListListItemDto ToListItemDto(WorkList workList)
    {
        return new WorkListListItemDto(
            workList.Id,
            workList.Name,
            workList.CreatedAt,
            workList.ListType?.Name,
            workList.Cover?.Id,
            ImageUrlBuilder.ToUrl(workList.Cover),
            workList.IsActive);
    }

    private static WorkListDetailDto ToDetailDto(WorkList workList)
    {
        return new WorkListDetailDto(
            workList.Id,
            workList.Name,
            workList.Description,
            workList.Cover?.Id,
            ImageUrlBuilder.ToUrl(workList.Cover),
            workList.Color,
            workList.ListType?.Id,
            workList.ListType?.Name,
            workList.Visibility,
            workList.OwnerType,
            workList.Owner?.Id,
            workList.IsActive,
            workList.CreatedAt,
            workList.WorkListItems
                .OrderBy(workItem => workItem.Position)
                .Select(ToWorkItemDto)
                .ToList());
    }

    private static WorkListWorkItemDto ToWorkItemDto(WorkListItem workItem)
    {
        return new WorkListWorkItemDto(workItem.Work.Id, workItem.Position, ToWorkDto(workItem.Work));
    }

    private static WorkListWorkDto ToWorkDto(Work work)
    {
        return new WorkListWorkDto(
            work.Id,
            work.Title,
            work.NumberValue,
            work.Series?.Id,
            work.Series?.Name,
            work.GetFranchiseId(),
            work.GetFranchiseName(),
            work.GetPublisherId(),
            work.GetPublisherName(),
            work.Cover?.Id,
            ImageUrlBuilder.ToUrl(work.Cover),
            work.IsActive);
    }

    private static CatalogListCardDto ToCatalogCardDto(WorkListCardData workListData)
    {
        var workList = workListData.WorkList;

        return new CatalogListCardDto(
            workList.Id,
            workList.Name,
            workList.ListType?.Id,
            workList.ListType?.Name,
            workList.Color,
            ImageUrlBuilder.ToUrl(workList.Cover),
            workListData.WorkCount,
            workListData.ReadingProgressPercentage,
            workListData.AverageRating,
            workList.RatingCount);
    }

    private static CatalogListDetailDto ToCatalogDetailDto(
        WorkList workList,
        Dictionary<long, WorkReadingProgress> progressByWorkId,
        long? currentWorkId)
    {
        var orderedItems = workList.WorkListItems
            .OrderBy(workItem => workItem.Position)
            .ToList();

        var works = orderedItems
            .Select(workItem => ToCatalogWorkItemDto(workItem, progressByWorkId))
            .ToList();

        return new CatalogListDetailDto(
            workList.Id,
            workList.Name,
            workList.ListType?.Id,
            workList.ListType?.Name,
            workList.Description,
            workList.Color,
            ImageUrlBuilder.ToUrl(workList.Cover),
            works.Count,
            CalculateListReadingProgress(orderedItems, progressByWorkId),
            currentWorkId,
            workList.RatingCount == 0 ? null : workList.AverageRating,
            workList.RatingCount,
            works);
    }

    private static int? CalculateListReadingProgress(
        IReadOnlyList<WorkListItem> orderedItems,
        Dictionary<long, WorkReadingProgress> progressByWorkId)
    {
        var totalWorks = orderedItems.Count;
        if (totalWorks == 0)
        {
            return 0;
        }

        var hasAnyProgress = orderedItems.Any(workItem => progressByWorkId.ContainsKey(workItem.Work.Id));
        if (!hasAnyProgress)
        {
            return null;
        }

        var completedWorks = orderedItems.Count(workItem =>
            progressByWorkId.TryGetValue(workItem.Work.Id, out var progress) &&
            progress.State == ReadingState.Completed);

        return completedWorks * 100 / totalWorks;
    }

    private static CatalogListWorkItemDto ToCatalogWorkItemDto(
        WorkListItem workItem,
        Dictionary<long, WorkReadingProgress> progressByWorkId)
    {
        var work = workItem.Work;
        progressByWorkId.TryGetValue(work.Id, out var progress);
        return new CatalogListWorkItemDto(
            workItem.Position,
            new CatalogListWorkDto(
                work.Id,
                work.Title,
                work.Description,
                MapPublisherNode(work)?.Id,
                MapPublisherNode(work)?.Name,
                MapPublisherNode(work)?.Color,
                MapFranchiseNode(work)?.Id,
                MapFranchiseNode(work)?.Name,
                MapFranchiseNode(work)?.Color,
                MapNode(work.Series)?.Id,
                MapNode(work.Series)?.Name,
                MapNode(work.Series)?.Color,
                work.PublicationDate,
                ImageUrlBuilder.ToUrl(work.Cover),
                work.WorkType?.Id,
                work.WorkType?.Name,
                work.NumberValue,
                work.CreatedAt,
                progress?.PercentageReading));
    }

    private static WorkCatalogNodeDto? MapPublisherNode(Work work)
    {
        var publisher = work.Publisher ?? work.Franchise?.Publisher ?? work.Series?.Franchise?.Publisher;
        return MapNode(publisher);
    }

    private static WorkCatalogNodeDto? MapFranchiseNode(Work work)
    {
        var franchise = work.Franchise ?? work.Series?.Franchise;
        return MapNode(franchise);
    }

    private static WorkCatalogNodeDto? MapNode(Series? series)
    {
        return series is null ? null : new WorkCatalogNodeDto(series.Id, series.Name, series.Color);
    }

    private static WorkCatalogNodeDto? MapNode(Franchise? franchise)
    {
        return franchise is null ? null : new WorkCatalogNodeDto(franchise.Id, franchise.Name, franchise.Color);
    }

    private static WorkCatalogNodeDto? MapNode(Publisher? publisher)
    {
        return publisher is null ? null : new WorkCatalogNodeDto(publisher.Id, publisher.Name, publisher.Color);
    }
}
