namespace Application.DTOs;

public record WorkRatingVoteRequest(
    int? Stars,
    string? Review);

public record GetWorkRatingsRequest(
    int currentPage = 1,
    int pageSize = 12,
    string? orderBy = null,
    string? orderDir = null);

public record WorkRatingDto(
    long Id,
    long WorkId,
    int Stars,
    string? Review,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record WorkRatingListItemDto(
    long Id,
    long UserId,
    string UserName,
    string? UrlAvatar,
    int Stars,
    string? Review,
    DateTime CreatedAt);
