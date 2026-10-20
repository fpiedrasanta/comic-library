using Application.DTOs;
using Domain.Entities;

namespace Application.Helpers;

public static class WorkCardMapper
{
    public static WorkCatalogItemDto ToCard(Work work, WorkReadingProgress? readingProgress = null, bool isFavorite = false, bool isInPersonalList = false)
    {
        return new WorkCatalogItemDto(
            work.Id,
            work.WorkType?.Id,
            work.GetWorkTypeName(),
            work.Title,
            work.Description,
            work.NumberValue,
            work.PublicationDate,
            work.CreatedAt,
            work.GetCoverId(),
            ImageUrlBuilder.ToUrl(work.Cover),
            ToNode(work.Series),
            ToFranchiseNode(work),
            ToPublisherNode(work),
            ToProgress(readingProgress),
            ToAverageRating(work),
            isFavorite,
            isInPersonalList);
    }

    public static double? ToAverageRating(Work work)
    {
        return work.RatingCount > 0 ? work.AverageRating : null;
    }

    public static ReaderMyProgressDto? ToProgress(WorkReadingProgress? readingProgress)
    {
        return readingProgress is null
            ? null
            : new ReaderMyProgressDto(
                readingProgress.CurrentPage,
                readingProgress.TotalPages,
                readingProgress.PercentageReading,
                readingProgress.LastReadAt,
                readingProgress.State.ToString());
    }

    private static WorkCatalogNodeDto? ToFranchiseNode(Work work)
    {
        var franchise = work.Franchise ?? work.Series?.Franchise;
        return ToNode(franchise);
    }

    private static WorkCatalogNodeDto? ToPublisherNode(Work work)
    {
        var publisher = work.Publisher ?? work.Franchise?.Publisher ?? work.Series?.Franchise.Publisher;
        return ToNode(publisher);
    }

    private static WorkCatalogNodeDto? ToNode(Series? series)
    {
        return series is null ? null : new WorkCatalogNodeDto(series.Id, series.Name, series.Color);
    }

    private static WorkCatalogNodeDto? ToNode(Franchise? franchise)
    {
        return franchise is null ? null : new WorkCatalogNodeDto(franchise.Id, franchise.Name, franchise.Color);
    }

    private static WorkCatalogNodeDto? ToNode(Publisher? publisher)
    {
        return publisher is null ? null : new WorkCatalogNodeDto(publisher.Id, publisher.Name, publisher.Color);
    }
}
