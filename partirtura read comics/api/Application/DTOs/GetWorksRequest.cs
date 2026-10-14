using Domain.Enums;

namespace Application.DTOs;

public record GetWorksRequest(
    int currentPage = 1,
    int pageSize = 12,
    string? orderBy = null,
    string? orderDir = null,
    string? search = null,
    long? workTypeId = null,
    bool? isActive = null,
    long? languageId = null,
    ContentStatus? contentStatus = null,
    DateTime? publicationDateFrom = null,
    DateTime? publicationDateTo = null,
    long? publisherId = null,
    long? franchiseId = null,
    long? seriesId = null,
    bool? iaRequest = null,
    IAProcessingStatus? iaStatus = null,
    bool? withDescription = null);