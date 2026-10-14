namespace Application.DTOs;

public record PersonListItemDto(
    long Id,
    string Name,
    bool IsActive);
