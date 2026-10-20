namespace Application.DTOs;

public record CreatePersonalListRequest(
    string Name);

public record UpdatePersonalListRequest(
    string Name);

public record AddWorkToPersonalListRequest(
    long WorkId);

public record PersonalListWorkPositionRequest(
    long WorkId,
    int Position);

public record ReorderPersonalListWorksRequest(
    IReadOnlyList<PersonalListWorkPositionRequest> Works);

public record PersonalListSummaryDto(
    long Id,
    string Name,
    string? Description,
    string? Color,
    string? UrlCover,
    int WorkCount,
    DateTime CreatedAt);
