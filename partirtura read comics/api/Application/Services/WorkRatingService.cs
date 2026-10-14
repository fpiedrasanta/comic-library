using Application.Constants;
using Application.DTOs;
using Application.Helpers;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class WorkRatingService : IWorkRatingService
{
    public const int MinimumStars = 0;
    public const int MaximumStars = 5;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WorkRatingService> _logger;

    public WorkRatingService(IUnitOfWork unitOfWork, ILogger<WorkRatingService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<WorkRatingDto> CreateOrUpdateAsync(long workId, long userId, int? stars, string? review, CancellationToken cancellationToken = default)
    {
        ValidateIdentifiers(workId, userId);
        var score = NormalizeStars(stars);
        var comment = NormalizeReview(review);

        var work = await GetActiveWorkAsync(workId, cancellationToken);
        var user = await GetUserAsync(userId, cancellationToken);
        var existingRating = await _unitOfWork.WorkRatingRepository.GetByUserIdAndWorkIdAsync(userId, workId, cancellationToken);

        var rating = existingRating is null
            ? await CreateRatingAsync(work, user, score, comment, cancellationToken)
            : await EditRatingAsync(work, existingRating, score, comment, cancellationToken);

        return MapRating(rating, work.Id);
    }

    public async Task<ListResponse<WorkRatingListItemDto>> GetPagedByWorkIdAsync(long workId, GetWorkRatingsRequest request, CancellationToken cancellationToken = default)
    {
        if (workId <= 0)
        {
            throw new ValidationException("The work identifier is required.");
        }

        var currentPage = request.currentPage;
        var pageSize = request.pageSize;
        PaginationGuard.Normalize(PaginationGuard.DefaultPageSize, PaginationGuard.MaxPageSize, ref currentPage, ref pageSize);

        var orderBy = string.IsNullOrWhiteSpace(request.orderBy) ? WorkRatingSortFields.CreatedAt : request.orderBy;
        var orderDir = string.IsNullOrWhiteSpace(request.orderDir) ? SortDirection.DESC : request.orderDir;

        var work = await GetActiveWorkAsync(workId, cancellationToken);

        var (items, totalCount) = await _unitOfWork.WorkRatingRepository.GetPagedByWorkIdAsync(
            work.Id,
            currentPage,
            pageSize,
            orderBy,
            orderDir,
            cancellationToken);

        var dtos = items.Select(MapListItem).ToList();

        return PaginationGuard.Build(currentPage, pageSize, totalCount, dtos);
    }

    private async Task<WorkRating> CreateRatingAsync(Work work, User user, int score, string? comment, CancellationToken cancellationToken)
    {
        var rating = new WorkRating
        {
            Work = work,
            User = user,
            Stars = score,
            Review = comment,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        try
        {
            await _unitOfWork.BeginTransAsync(cancellationToken);
            await _unitOfWork.WorkRatingRepository.ApplyNewVoteToWorkAccumulatorsAsync(work.Id, score, cancellationToken);
            await _unitOfWork.WorkRatingRepository.AddAsync(rating, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
        }
        catch (Exception exception) when (!cancellationToken.IsCancellationRequested)
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            _unitOfWork.WorkRatingRepository.Detach(rating);

            var concurrentRating = await _unitOfWork.WorkRatingRepository.GetByUserIdAndWorkIdAsync(user.Id, work.Id, cancellationToken);
            if (concurrentRating is null)
            {
                throw;
            }

            _logger.LogWarning(
                exception,
                "Concurrent first vote detected for Work {WorkId} by User {UserId}. The existing vote is edited instead of creating a duplicate.",
                work.Id,
                user.Id);

            return await EditRatingAsync(work, concurrentRating, score, comment, cancellationToken);
        }

        _logger.LogInformation("Vote created for Work {WorkId} by User {UserId} with {Stars} stars.", work.Id, user.Id, score);

        return rating;
    }

    private async Task<WorkRating> EditRatingAsync(Work work, WorkRating rating, int score, string? comment, CancellationToken cancellationToken)
    {
        var previousStars = rating.Stars;
        var scoreChanged = previousStars != score;

        try
        {
            await _unitOfWork.BeginTransAsync(cancellationToken);

            if (scoreChanged)
            {
                await _unitOfWork.WorkRatingRepository.ApplyScoreChangeToWorkAccumulatorsAsync(work.Id, previousStars, score, cancellationToken);
            }

            rating.Stars = score;
            rating.Review = comment;
            rating.UpdatedAt = DateTime.UtcNow;
            rating.IsActive = true;
            await _unitOfWork.WorkRatingRepository.UpdateAsync(rating, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _unitOfWork.CommitAsync(cancellationToken);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }

        _logger.LogInformation("Vote updated for Work {WorkId} by User {UserId} from {PreviousStars} to {Stars} stars.", work.Id, rating.User.Id, previousStars, score);

        return rating;
    }

    private async Task<Work> GetActiveWorkAsync(long workId, CancellationToken cancellationToken)
    {
        var work = await _unitOfWork.WorkRepository.GetByIdAsync(workId, cancellationToken);
        Guard.RequireActive(work, nameof(Work));
        return work!;
    }

    private async Task<User> GetUserAsync(long userId, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        Guard.Require(user, "User does not exist.");
        return user!;
    }

    private static void ValidateIdentifiers(long workId, long userId)
    {
        if (workId <= 0)
        {
            throw new ValidationException("The work identifier is required.");
        }

        if (userId <= 0)
        {
            throw new ValidationException("The user identifier is required.");
        }
    }

    private static int NormalizeStars(int? stars)
    {
        if (stars is null)
        {
            return MinimumStars;
        }

        if (stars < MinimumStars || stars > MaximumStars)
        {
            throw new ValidationException($"The score must be between {MinimumStars} and {MaximumStars}.");
        }

        return stars.Value;
    }

    private static string? NormalizeReview(string? review)
    {
        return string.IsNullOrWhiteSpace(review) ? null : review.Trim();
    }

    private static WorkRatingDto MapRating(WorkRating rating, long workId)
    {
        return new WorkRatingDto(rating.Id, workId, rating.Stars, rating.Review, rating.CreatedAt, rating.UpdatedAt);
    }

    private static WorkRatingListItemDto MapListItem(WorkRating rating)
    {
        var user = rating.User;
        var userName = user is null ? string.Empty : $"{user.FirstName} {user.LastName}".Trim();

        return new WorkRatingListItemDto(
            rating.Id,
            user?.Id ?? 0,
            userName,
            ImageUrlBuilder.ToUrl(user?.Avatar),
            rating.Stars,
            rating.Review,
            rating.CreatedAt);
    }
}
