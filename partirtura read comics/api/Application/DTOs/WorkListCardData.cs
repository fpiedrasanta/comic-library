using Domain.Entities;

namespace Application.DTOs;

public record WorkListCardData(
    WorkList WorkList,
    int WorkCount,
    int? ReadingProgressPercentage,
    double? AverageRating);
