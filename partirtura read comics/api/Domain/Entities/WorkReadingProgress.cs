using Domain.Enums;

namespace Domain.Entities;

public class WorkReadingProgress
{
    public long Id { get; set; }
    public int CurrentPage { get; set; } = 0;
    public int TotalPages { get; set; } = 0;
    public int PercentageReading { get; set; } = 0;
    public DateTimeOffset? LastReadAt { get; set; }
    public ReadingState State { get; set; } = ReadingState.Reading;

    public virtual Work? Work { get; set; }
    public virtual User? User { get; set; }
}