namespace Application.DTOs;

public record ContentStatusDto(
    string Status,
    string? Error,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    int PageCount);
