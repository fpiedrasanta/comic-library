namespace Application.DTOs;

public record ListTypeListItemDto(
    long Id,
    string Name,
    bool IsActive);

public record CreateListTypeRequest(
    string Name);

public record UpdateListTypeRequest(
    string Name);
