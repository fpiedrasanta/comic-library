using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class ListRatingService : IListRatingService
{
    public const int MinimumStars = 1;
    public const int MaximumStars = 5;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ListRatingService> _logger;

    public ListRatingService(IUnitOfWork unitOfWork, ILogger<ListRatingService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ListRatingDto> CreateOrUpdateAsync(long workListId, long userId, int stars, string? review, CancellationToken cancellationToken = default)
    {
        if (workListId <= 0)
        {
            throw new ValidationException("The work list identifier is required.");
        }

        if (userId <= 0)
        {
            throw new ValidationException("The user identifier is required.");
        }

        if (stars < MinimumStars || stars > MaximumStars)
        {
            throw new ValidationException($"The score must be between {MinimumStars} and {MaximumStars}.");
        }

        var comment = string.IsNullOrWhiteSpace(review) ? null : review.Trim();

        var workList = await _unitOfWork.WorkListRepository.GetByIdAsync(workListId, cancellationToken)
                       ?? throw new BusinessNotFoundException("The work list does not exist.");

        if (!workList.IsActive)
        {
            throw new BusinessNotFoundException("The work list does not exist.");
        }

        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken)
                   ?? throw new BusinessNotFoundException("The user does not exist.");

        var existingRating = await _unitOfWork.ListRatingRepository.GetByUserIdAndWorkListIdAsync(userId, workListId, cancellationToken);

        var rating = existingRating is null
            ? await CreateRatingAsync(workList, user, stars, comment, cancellationToken)
            : await EditRatingAsync(workList, existingRating, stars, comment, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapRating(rating, workList.Id);
    }

    private async Task<ListRating> CreateRatingAsync(WorkList workList, User user, int stars, string? comment, CancellationToken cancellationToken)
    {
        var rating = new ListRating
        {
            WorkList = workList,
            User = user,
            Stars = stars,
            Review = comment,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null,
            IsActive = true
        };

        try
        {
            await _unitOfWork.BeginTransAsync(cancellationToken);
            await _unitOfWork.ListRatingRepository.ApplyNewVoteToWorkListAccumulatorsAsync(workList.Id, stars, cancellationToken);
            await _unitOfWork.ListRatingRepository.AddAsync(rating, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
        }
        catch (Exception exception) when (!cancellationToken.IsCancellationRequested)
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            _unitOfWork.ListRatingRepository.Detach(rating);

            var concurrentRating = await _unitOfWork.ListRatingRepository.GetByUserIdAndWorkListIdAsync(user.Id, workList.Id, cancellationToken);
            if (concurrentRating is null)
            {
                throw;
            }

            _logger.LogWarning(
                exception,
                "Concurrent first vote detected for WorkList {WorkListId} by User {UserId}. The existing vote is edited instead of creating a duplicate.",
                workList.Id,
                user.Id);

            return await EditRatingAsync(workList, concurrentRating, stars, comment, cancellationToken);
        }

        _logger.LogInformation("Rating created for WorkList {WorkListId} by User {UserId} with {Stars} stars.", workList.Id, user.Id, stars);

        return rating;
    }

    private async Task<ListRating> EditRatingAsync(WorkList workList, ListRating rating, int stars, string? comment, CancellationToken cancellationToken)
    {
        var reactivating = !rating.IsActive;
        var previousStars = rating.Stars;
        var scoreChanged = previousStars != stars;

        try
        {
            await _unitOfWork.BeginTransAsync(cancellationToken);

            if (reactivating)
            {
                await _unitOfWork.ListRatingRepository.ApplyReactivationToWorkListAccumulatorsAsync(workList.Id, stars, cancellationToken);
            }
            else if (scoreChanged)
            {
                await _unitOfWork.ListRatingRepository.ApplyScoreChangeToWorkListAccumulatorsAsync(workList.Id, previousStars, stars, cancellationToken);
            }

            rating.Stars = stars;
            rating.Review = comment;
            rating.UpdatedAt = DateTime.UtcNow;
            rating.IsActive = true;
            await _unitOfWork.ListRatingRepository.UpdateAsync(rating, cancellationToken);
            await _unitOfWork.CommitAsync(cancellationToken);
        }
        catch
        {
            await _unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }

        var outcome = reactivating ? "reactivated" : "updated";
        _logger.LogInformation(
            "Rating {Outcome} for WorkList {WorkListId} by User {UserId} from {PreviousStars} to {Stars} stars.",
            outcome, workList.Id, rating.User.Id, previousStars, stars);

        return rating;
    }

    private static ListRatingDto MapRating(ListRating rating, long workListId)
    {
        return new ListRatingDto(rating.Id, workListId, rating.Stars, rating.Review, rating.CreatedAt, rating.UpdatedAt);
    }
}
