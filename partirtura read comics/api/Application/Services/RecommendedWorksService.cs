using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class RecommendedWorksService : IRecommendedWorksService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RecommendedWorksService> _logger;

    public RecommendedWorksService(IUnitOfWork unitOfWork, ILogger<RecommendedWorksService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IReadOnlyList<WorkCatalogItemDto>> GetRecommendedAsync(long? userId, string? sortBy, CancellationToken cancellationToken = default)
    {
        var criterion = NormalizeSortBy(sortBy);

        var works = await _unitOfWork.WorkRepository.GetRecommendedAsync(userId, criterion, cancellationToken);

        var dtos = works.Select(work => WorkCardMapper.ToCard(work)).ToList();

        _logger.LogInformation(
            "Recommended works consulted by User {UserId}: {Count} items ordered by {Criterion}.",
            userId,
            dtos.Count,
            criterion);

        return dtos;
    }

    private static string NormalizeSortBy(string? sortBy)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
        {
            return RecommendedSortFields.MostPopular;
        }

        var candidate = sortBy.Trim();

        if (string.Equals(candidate, RecommendedSortFields.MostPopular, StringComparison.OrdinalIgnoreCase))
        {
            return RecommendedSortFields.MostPopular;
        }

        if (string.Equals(candidate, RecommendedSortFields.RecentlyAdded, StringComparison.OrdinalIgnoreCase))
        {
            return RecommendedSortFields.RecentlyAdded;
        }

        if (string.Equals(candidate, RecommendedSortFields.MostRated, StringComparison.OrdinalIgnoreCase))
        {
            return RecommendedSortFields.MostRated;
        }

        throw new ValidationException(
            $"The sort criterion must be one of: {RecommendedSortFields.MostPopular}, {RecommendedSortFields.RecentlyAdded}, {RecommendedSortFields.MostRated}.");
    }
}
