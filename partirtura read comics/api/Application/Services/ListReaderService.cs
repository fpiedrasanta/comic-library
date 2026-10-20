using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class ListReaderService : IListReaderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWorkService _workService;
    private readonly ILogger<ListReaderService> _logger;

    public ListReaderService(IUnitOfWork unitOfWork, IWorkService workService, ILogger<ListReaderService> logger)
    {
        _unitOfWork = unitOfWork;
        _workService = workService;
        _logger = logger;
    }

    public async Task<ListReaderContextDto> GetReaderContextAsync(long workListId, long workId, long? userId, CancellationToken cancellationToken = default)
    {
        if (workListId <= 0)
        {
            throw new ValidationException("Work list identifier is required.");
        }

        if (workId <= 0)
        {
            throw new ValidationException("Work identifier is required.");
        }

        var workList = await _unitOfWork.WorkListRepository.GetCatalogByIdAsync(workListId, cancellationToken, userId);
        if (workList is null)
        {
            throw new BusinessNotFoundException("Work list does not exist.");
        }

        var orderedItems = workList.WorkListItems
            .OrderBy(workItem => workItem.Position)
            .ToList();

        var requestedWork = orderedItems.FirstOrDefault(workItem => workItem.Work.Id == workId)?.Work;
        if (requestedWork is null)
        {
            throw new BusinessNotFoundException("The work does not belong to the list.");
        }

        var currentWorkId = await ResolveCurrentWorkIdAsync(workList, orderedItems, userId, cancellationToken);
        var listRating = await GetUserListRatingAsync(userId, workListId, cancellationToken);

        var progressByWorkId = await GetReadingProgressByWorkIdAsync(orderedItems, userId, cancellationToken);
        var ratingByWorkId = await GetWorkRatingByWorkIdAsync(orderedItems, userId, cancellationToken);

        var workItems = orderedItems.Select(workItem =>
        {
            var work = workItem.Work;
            progressByWorkId.TryGetValue(work.Id, out var progress);
            ratingByWorkId.TryGetValue(work.Id, out var rating);

            return new ReaderListWorkItemDto(
                workItem.Position,
                new ReaderListWorkDto(
                    work.Id,
                    work.Title,
                    work.Description,
                    ImageUrlBuilder.ToUrl(work.Cover),
                    progress?.PercentageReading),
                progress?.CurrentPage,
                rating is null ? null : new ReaderMyRatingDto(rating.Stars, rating.Review));
        }).ToList();

        var readerPages = await _workService.GetReaderPagesAsync(workId, userId, cancellationToken);

        return new ListReaderContextDto(
            new ReaderListCatalogDto(
                workList.Id,
                workList.Name,
                workList.ListType?.Id,
                workList.ListType?.Name,
                workList.Description,
                workList.Color,
                ImageUrlBuilder.ToUrl(workList.Cover),
                workItems.Count,
                CalculateListReadingProgress(orderedItems, progressByWorkId),
                currentWorkId,
                workList.RatingCount == 0 ? null : workList.AverageRating,
                workList.RatingCount,
                listRating is null
                    ? null
                    : new ReaderListRatingDto(workList.Id, listRating.Stars, listRating.Review, listRating.CreatedAt, listRating.UpdatedAt)),
            workItems,
            requestedWork.Id,
            readerPages.Pages,
            readerPages.CurrentPage,
            readerPages.MyRating);
    }

    private async Task<long?> ResolveCurrentWorkIdAsync(WorkList workList, IReadOnlyList<WorkListItem> orderedItems, long? userId, CancellationToken cancellationToken)
    {
        if (userId is null || userId.Value <= 0)
        {
            return orderedItems.FirstOrDefault()?.Work.Id;
        }

        var listProgress = await _unitOfWork.ListReadingProgressRepository
            .GetByUserIdAndWorkListIdAsync(userId.Value, workList.Id, cancellationToken);

        var currentWork = listProgress?.CurrentWork;
        if (currentWork is not null && orderedItems.Any(workItem => workItem.Work.Id == currentWork.Id))
        {
            return currentWork.Id;
        }

        return orderedItems.FirstOrDefault()?.Work.Id;
    }

    private async Task<ReaderListRatingDto?> GetUserListRatingAsync(long? userId, long workListId, CancellationToken cancellationToken)
    {
        if (userId is null || userId.Value <= 0)
        {
            return null;
        }

        var rating = await _unitOfWork.ListRatingRepository.GetByUserIdAndWorkListIdAsync(userId.Value, workListId, cancellationToken);
        if (rating is null || !rating.IsActive)
        {
            return null;
        }

        return new ReaderListRatingDto(rating.WorkList.Id, rating.Stars, rating.Review, rating.CreatedAt, rating.UpdatedAt);
    }

    private async Task<Dictionary<long, WorkReadingProgress>> GetReadingProgressByWorkIdAsync(IReadOnlyList<WorkListItem> orderedItems, long? userId, CancellationToken cancellationToken)
    {
        if (userId is null || userId.Value <= 0)
        {
            return new Dictionary<long, WorkReadingProgress>();
        }

        var workIds = orderedItems.Select(workItem => workItem.Work.Id).ToList();
        if (workIds.Count == 0)
        {
            return new Dictionary<long, WorkReadingProgress>();
        }

        var progressRecords = await _unitOfWork.WorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync(workIds, userId.Value, cancellationToken);
        return progressRecords.ToDictionary(progress => progress.Work!.Id);
    }

    private async Task<Dictionary<long, WorkRating>> GetWorkRatingByWorkIdAsync(IReadOnlyList<WorkListItem> orderedItems, long? userId, CancellationToken cancellationToken)
    {
        if (userId is null || userId.Value <= 0)
        {
            return new Dictionary<long, WorkRating>();
        }

        var workIds = orderedItems.Select(workItem => workItem.Work.Id).ToList();
        if (workIds.Count == 0)
        {
            return new Dictionary<long, WorkRating>();
        }

        return await _unitOfWork.WorkRatingRepository.GetByUserIdAndWorkIdsAsync(userId.Value, workIds, cancellationToken);
    }

    private int? CalculateListReadingProgress(IReadOnlyList<WorkListItem> orderedItems, Dictionary<long, WorkReadingProgress> progressByWorkId)
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
            progress.State == Domain.Enums.ReadingState.Completed);

        return completedWorks * 100 / totalWorks;
    }
}
