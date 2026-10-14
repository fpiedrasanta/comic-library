namespace Application.DTOs;

public record WorkTypeListItemDto(
    long Id,
    string Name,
    bool IsActive);

public record CreateWorkTypeRequest(
    string Name);

public record UpdateWorkTypeRequest(
    string Name);