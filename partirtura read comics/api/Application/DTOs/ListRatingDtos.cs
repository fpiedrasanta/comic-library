namespace Application.DTOs;

public record ListRatingVoteRequest(
    int Stars,
    string? Review);

public record ListRatingDto(
    long Id,
    long WorkListId,
    int Stars,
    string? Review,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
