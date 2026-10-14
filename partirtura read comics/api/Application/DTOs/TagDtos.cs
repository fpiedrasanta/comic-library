namespace Application.DTOs;

public record TagListItemDto(
    long Id,
    string Name,
    bool IsActive);

public record CreateTagRequest(
    string Name);
