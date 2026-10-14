namespace Application.DTOs;

public class GetPublicFranchisesRequest : ListRequest
{
    public long? PublisherId { get; set; }
}

public class GetPublicSeriesRequest : ListRequest
{
    public long? PublisherId { get; set; }
    public long? FranchiseId { get; set; }
}

public record PublisherFilterDto(
    long Id,
    string Name,
    string? Color);

public record FranchiseFilterDto(
    long Id,
    string Name,
    string? Color,
    long? PublisherId,
    string? PublisherName);

public record SeriesFilterDto(
    long Id,
    string Name,
    string? Color,
    long? FranchiseId,
    string? FranchiseName,
    long? PublisherId,
    string? PublisherName);

public record WorkTypeFilterDto(
    long Id,
    string Name);

public record ListTypeFilterDto(
    long Id,
    string Name);