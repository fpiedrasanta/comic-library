using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class PersonalListService : IPersonalListService
{
    private const int MaxNameLength = 200;
    private const int TemporaryPositionOffset = -1000000;
    private const string WorkListNotFound = "The work list does not exist or is not owned by the user.";
    private const string WorkNotFound = "The work does not exist or is inactive.";
    private const string DuplicateWork = "The work already belongs to the list.";
    private const string DuplicateName = "A work list with the same name already exists.";
    private const string WorkNotInList = "One or more works do not belong to the list.";
    private const string DuplicatePosition = "Each work position must be unique within the request.";

    private readonly IFileStorageService _fileStorageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PersonalListService> _logger;

    public PersonalListService(
        IFileStorageService fileStorageService,
        IUnitOfWork unitOfWork,
        ILogger<PersonalListService> logger)
    {
        _fileStorageService = fileStorageService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PersonalListSummaryDto> CreateAsync(
        CreatePersonalListRequest request,
        long userId,
        CancellationToken cancellationToken = default)
    {
        var name = RequireName(request.Name);
        var user = await GetUserAsync(userId, cancellationToken);
        await EnsureNameAvailableAsync(name, null, cancellationToken);

        var cover = await _fileStorageService.SaveDefaultListCoverAsync(cancellationToken);
        await _unitOfWork.ImageRepository.AddAsync(cover, cancellationToken);

        await _unitOfWork.BeginTransAsync(cancellationToken);
        try
        {
            var workList = new WorkList
            {
                Name = name,
                Description = string.Format(PersonalListDefaults.DescriptionFormat, GetDisplayName(user)),
                Cover = cover,
                Color = PersonalListDefaults.Color,
                ListType = null,
                OwnerType = OwnerType.User,
                Owner = user,
                Visibility = Visibility.Private,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.WorkListRepository.AddAsync(workList, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            _logger.LogInformation("Personal list {WorkListId} created by user {UserId}.", workList.Id, userId);
            return ToSummaryDto(workList, 0);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            await DeleteCoverAsync(cover, cancellationToken);
            throw;
        }
    }

    public async Task<PersonalListSummaryDto> GetSummaryAsync(long listId, long userId, CancellationToken cancellationToken = default)
    {
        var workList = await GetPersonalListAsync(listId, userId, cancellationToken);
        return ToSummaryDto(workList, workList.WorkListItems.Count);
    }

    public async Task<IReadOnlyList<PersonalListMembershipDto>> GetWithMembershipAsync(
        GetPersonalListsRequest request,
        long userId,
        CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("User identifier is required.");
        }

        if (request.pageSize < 1)
        {
            throw new ValidationException("The page size must be greater than zero.");
        }

        var pageSize = Math.Min(request.pageSize, PaginationGuard.MaxPageSize);

        var lists = await _unitOfWork.WorkListRepository.GetPersonalWithMembershipAsync(
            userId,
            request.search,
            pageSize,
            request.workId,
            cancellationToken);

        return lists
            .Select(list => new PersonalListMembershipDto(
                list.Id,
                list.Name,
                list.Description,
                list.Color,
                ImageUrlBuilder.ToUrl(list.Cover),
                list.WorkCount,
                list.ContainsWork))
            .ToList();
    }

    public async Task<PersonalListSummaryDto> RenameAsync(
        long listId,
        UpdatePersonalListRequest request,
        long userId,
        CancellationToken cancellationToken = default)
    {
        var name = RequireName(request.Name);
        var workList = await GetPersonalListAsync(listId, userId, cancellationToken);
        await EnsureNameAvailableAsync(name, workList.Id, cancellationToken);

        workList.Name = name;
        await _unitOfWork.WorkListRepository.UpdateAsync(workList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Personal list {WorkListId} renamed by user {UserId}.", listId, userId);
        return ToSummaryDto(workList, workList.WorkListItems.Count);
    }

    public async Task DeleteAsync(long listId, long userId, CancellationToken cancellationToken = default)
    {
        var workList = await _unitOfWork.WorkListRepository.GetPersonalWithItemsAsync(listId, userId, cancellationToken)
                       ?? throw new BusinessNotFoundException(WorkListNotFound);

        var coverPath = workList.Cover?.StoragePath;

        await _unitOfWork.BeginTransAsync(cancellationToken);
        try
        {
            await _unitOfWork.WorkListRepository.DeleteAsync(workList, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            await DeleteCoverPathAsync(coverPath, cancellationToken);
            _logger.LogInformation("Personal list {WorkListId} deleted by user {UserId}.", listId, userId);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<PersonalListSummaryDto> AddWorkAsync(
        long listId,
        AddWorkToPersonalListRequest request,
        long userId,
        CancellationToken cancellationToken = default)
    {
        var workList = await GetPersonalListAsync(listId, userId, cancellationToken);
        var work = await _unitOfWork.WorkRepository.GetByIdAsync(request.WorkId, cancellationToken);

        if (work is null || !work.IsActive)
        {
            throw new BusinessNotFoundException(WorkNotFound);
        }

        var existing = await _unitOfWork.WorkListItemRepository.GetAsync(listId, request.WorkId, cancellationToken);
        if (existing is not null)
        {
            throw new BusinessConflictException(DuplicateWork);
        }

        var maxPosition = await _unitOfWork.WorkListItemRepository.GetMaxPositionAsync(listId, cancellationToken);
        var workCount = workList.WorkListItems.Count;
        var workListItem = new WorkListItem
        {
            WorkList = workList,
            Work = work,
            Position = maxPosition + 1
        };

        await _unitOfWork.WorkListItemRepository.AddAsync(workListItem, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} added to personal list {WorkListId} by user {UserId}.", request.WorkId, listId, userId);
        return ToSummaryDto(workList, workCount + 1);
    }

    public async Task RemoveWorkAsync(long listId, long workId, long userId, CancellationToken cancellationToken = default)
    {
        var workList = await GetPersonalListAsync(listId, userId, cancellationToken);
        var workListItem = await _unitOfWork.WorkListItemRepository.GetAsync(listId, workId, cancellationToken)
                           ?? throw new BusinessNotFoundException(WorkNotInList);

        await _unitOfWork.WorkListItemRepository.RemoveAsync(workListItem, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Work {WorkId} removed from personal list {WorkListId} by user {UserId}.", workId, listId, userId);
    }

    public async Task ReorderWorksAsync(
        long listId,
        ReorderPersonalListWorksRequest request,
        long userId,
        CancellationToken cancellationToken = default)
    {
        var workList = await _unitOfWork.WorkListRepository.GetPersonalWithItemsAsync(listId, userId, cancellationToken)
                       ?? throw new BusinessNotFoundException(WorkListNotFound);

        if (request.Works.Count == 0)
        {
            return;
        }

        var requestedPositions = request.Works.Select(work => work.Position).ToList();
        if (requestedPositions.Distinct().Count() != requestedPositions.Count)
        {
            throw new BusinessConflictException(DuplicatePosition);
        }

        var itemsByWorkId = workList.WorkListItems.ToDictionary(item => item.Work.Id);
        var affectedItems = new List<WorkListItem>();

        foreach (var requestedWork in request.Works)
        {
            if (!itemsByWorkId.TryGetValue(requestedWork.WorkId, out var workListItem))
            {
                throw new BusinessNotFoundException(WorkNotInList);
            }

            affectedItems.Add(workListItem);
        }

        var requestedWorkIds = affectedItems.Select(item => item.Work.Id).ToHashSet();
        var positionsHeldByUntouchedItems = workList.WorkListItems
            .Where(item => !requestedWorkIds.Contains(item.Work.Id))
            .Select(item => item.Position)
            .ToHashSet();

        if (request.Works.Any(work => positionsHeldByUntouchedItems.Contains(work.Position)))
        {
            throw new BusinessConflictException(DuplicatePosition);
        }

        var requestedPositionsByWorkId = request.Works.ToDictionary(work => work.WorkId, work => work.Position);

        await _unitOfWork.BeginTransAsync(cancellationToken);
        try
        {
            foreach (var workListItem in affectedItems)
            {
                workListItem.Position = TemporaryPositionOffset + requestedPositionsByWorkId[workListItem.Work.Id];
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            foreach (var workListItem in affectedItems)
            {
                workListItem.Position = requestedPositionsByWorkId[workListItem.Work.Id];
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);

            _logger.LogInformation("Personal list {WorkListId} order updated by user {UserId}.", listId, userId);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task<WorkList> GetPersonalListAsync(long listId, long userId, CancellationToken cancellationToken)
    {
        if (listId <= 0)
        {
            throw new ValidationException("Work list identifier is required.");
        }

        if (userId <= 0)
        {
            throw new ValidationException("User identifier is required.");
        }

        return await _unitOfWork.WorkListRepository.GetPersonalWithItemsAsync(listId, userId, cancellationToken)
               ?? throw new BusinessNotFoundException(WorkListNotFound);
    }

    private async Task<User> GetUserAsync(long userId, CancellationToken cancellationToken)
    {
        if (userId <= 0)
        {
            throw new ValidationException("User identifier is required.");
        }

        return await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken)
               ?? throw new BusinessNotFoundException("The user does not exist.");
    }

    private async Task EnsureNameAvailableAsync(string name, long? currentWorkListId, CancellationToken cancellationToken)
    {
        var existing = await _unitOfWork.WorkListRepository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != currentWorkListId)
        {
            throw new BusinessConflictException(DuplicateName);
        }
    }

    private static string RequireName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ValidationException("Work list name is required.");
        }

        var trimmed = name.Trim();

        if (trimmed.Length > MaxNameLength)
        {
            throw new ValidationException($"Work list name cannot exceed {MaxNameLength} characters.");
        }

        return trimmed;
    }

    private static string GetDisplayName(User user)
    {
        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? user.Email : fullName;
    }

    private static PersonalListSummaryDto ToSummaryDto(WorkList workList, int workCount)
    {
        return new PersonalListSummaryDto(
            workList.Id,
            workList.Name,
            workList.Description,
            workList.Color,
            ImageUrlBuilder.ToUrl(workList.Cover),
            workCount,
            workList.CreatedAt);
    }

    private async Task DeleteCoverAsync(Image cover, CancellationToken cancellationToken)
    {
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
            _logger.LogWarning(exception, "Failed to delete the cover of the deleted personal list {StoragePath}", storagePath);
        }
    }
}
