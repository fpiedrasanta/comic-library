namespace Application.DTOs;

public record RoleListItemDto(
    long Id,
    string Name,
    bool IsActive);
