using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Enums;
using Domain.Exceptions;
using Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class ReadingHistoryService : IReadingHistoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ReadingHistoryService> _logger;

    public ReadingHistoryService(IUnitOfWork unitOfWork, ILogger<ReadingHistoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ListResponse<WorkCatalogItemDto>> GetPagedAsync(GetReadingHistoryRequest request, long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new ValidationException("The user identifier is required.");
        }

        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        var state = ParseState(request.state);

        var (progresses, totalCount) = await _unitOfWork.WorkReadingProgressRepository.GetPagedHistoryByUserIdAsync(
            userId,
            state,
            currentPage,
            pageSize,
            cancellationToken);

        var favoriteWorkIds = await GetFavoriteWorkIdsAsync(userId, progresses, cancellationToken);
        var favoriteWorkIdsSet = favoriteWorkIds.ToHashSet();

        var dtos = progresses.Select(progress =>
            WorkCardMapper.ToCard(progress.Work!, progress, favoriteWorkIdsSet.Contains(progress.Work!.Id))).ToList();

        _logger.LogInformation(
            "Reading history consulted by User {UserId}: page {CurrentPage}, {ItemCount} items of {TotalCount}, state filter {State}.",
            userId,
            currentPage,
            dtos.Count,
            totalCount,
            request.state ?? ReadingHistoryStates.All);

        return PaginationGuard.Build(currentPage, pageSize, totalCount, dtos);
    }

    private async Task<IReadOnlyList<long>> GetFavoriteWorkIdsAsync(long userId, IReadOnlyList<WorkReadingProgress> progresses, CancellationToken cancellationToken)
    {
        if (progresses.Count == 0)
        {
            return Array.Empty<long>();
        }

        var workIds = progresses.Select(progress => progress.Work!.Id).ToList();
        return await _unitOfWork.Favorites.GetFavoriteWorkIdsAsync(userId, workIds, cancellationToken);
    }

    private static ReadingState? ParseState(string? state)
    {
        if (string.IsNullOrWhiteSpace(state))
        {
            return null;
        }

        return state.Trim().ToLowerInvariant() switch
        {
            ReadingHistoryStates.Reading => ReadingState.Reading,
            ReadingHistoryStates.Completed => ReadingState.Completed,
            _ => null
        };
    }
}
