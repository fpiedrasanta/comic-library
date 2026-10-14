using Application.Interfaces;
using Application.Constants;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence;

namespace Infrastructure.Repositories;

public class WorkRepository(ApplicationDbContext context) : IWorkRepository
{
    private const string OrderByTitle = "title";
    private const string OrderByPublicationDate = "publicationdate";
    private const string OrderByNumber = "number";
    private const string CaseInsensitiveCollation = "utf8mb4_0900_ai_ci";

    private readonly ApplicationDbContext _context = context;

    public async Task<(IReadOnlyList<Work>, int)> GetPagedAsync(
        int currentPage,
        int pageSize,
        string? orderBy,
        string orderDir,
        string? search,
        long? workTypeId,
        bool? isActive,
        long? languageId,
        ContentStatus? contentStatus,
        DateTime? publicationDateFrom,
        DateTime? publicationDateTo,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        CancellationToken cancellationToken = default,
        bool? iaRequest = null,
        IAProcessingStatus? iaStatus = null,
        bool? withDescription = null)
    {
        IQueryable<Work> query = _context.Works.AsNoTracking();

        if (workTypeId.HasValue)
        {
            query = query.Where(w => EF.Property<long?>(w, "WorkTypeId") == workTypeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(w =>
                EF.Functions.Like(w.Title, $"%{searchTerm}%") ||
                (w.NumberValue != null && EF.Functions.Like(w.NumberValue, $"%{searchTerm}%")));
        }

        if (isActive.HasValue)
        {
            query = query.Where(w => w.IsActive == isActive.Value);
        }

        if (languageId.HasValue)
        {
            query = query.Where(w => w.Language != null && w.Language.Id == languageId.Value);
        }

        if (contentStatus.HasValue)
        {
            query = query.Where(w => w.ContentStatus == contentStatus.Value);
        }

        if (publicationDateFrom.HasValue)
        {
            query = query.Where(w => w.PublicationDate >= publicationDateFrom.Value);
        }

        if (publicationDateTo.HasValue)
        {
            query = query.Where(w => w.PublicationDate <= publicationDateTo.Value);
        }

        if (publisherId.HasValue)
        {
            query = query.Where(w => EF.Property<long?>(w, "PublisherId") == publisherId.Value);
        }

        if (franchiseId.HasValue)
        {
            query = query.Where(w => EF.Property<long?>(w, "FranchiseId") == franchiseId.Value);
        }

        if (seriesId.HasValue)
        {
            query = query.Where(w => EF.Property<long?>(w, "SeriesId") == seriesId.Value);
        }

        if (iaRequest.HasValue)
        {
            query = query.Where(w => w.IARequest == iaRequest.Value);
        }

        if (iaStatus.HasValue)
        {
            query = query.Where(w => w.IAStatus == iaStatus.Value);
        }

        if (withDescription.HasValue)
        {
            query = query.Where(w => withDescription.Value
                ? w.Description != null && w.Description != ""
                : w.Description == null || w.Description == "");
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyOrdering(query, orderBy, orderDir);

        query = query
            .Include(w => w.WorkType)
            .Include(w => w.Language)
            .Include(w => w.Cover)
            .Include(w => w.Series).ThenInclude(s => s!.Franchise).ThenInclude(f => f.Publisher)
            .Include(w => w.Franchise).ThenInclude(f => f!.Publisher)
            .Include(w => w.Publisher)
            .Include(w => w.PreviousNumber)
            .Include(w => w.NextNumber)
            .AsSplitQuery();

        var items = await query
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Work>, int)> GetCatalogPagedAsync(
        int currentPage,
        int pageSize,
        string? orderBy,
        string orderDir,
        string? search,
        long? publisherId,
        long? franchiseId,
        long? seriesId,
        long? workTypeId,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Work> query = _context.Works
            .AsNoTracking()
            .Where(w => w.IsActive);

        query = ApplyCatalogSearch(query, search);
        query = ApplyCatalogHierarchy(query, publisherId, franchiseId, seriesId);
        query = ApplyWorkTypeFilter(query, workTypeId);

        var totalCount = await query.CountAsync(cancellationToken);

        query = ApplyCatalogOrdering(query, orderBy, orderDir);

        var items = await query
            .Include(w => w.WorkType)
            .Include(w => w.Cover)
            .Include(w => w.Publisher)
            .Include(w => w.Franchise).ThenInclude(f => f!.Publisher)
            .Include(w => w.Series).ThenInclude(s => s!.Franchise).ThenInclude(f => f.Publisher)
            .AsSplitQuery()
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Work?> GetCatalogByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Works
            .AsNoTracking()
            .Where(w => w.Id == id && w.IsActive)
            .Include(w => w.Cover)
            .Include(w => w.Language)
            .Include(w => w.WorkType)
            .Include(w => w.Publisher).ThenInclude(p => p!.Image)
            .Include(w => w.Franchise).ThenInclude(f => f!.Image)
            .Include(w => w.Franchise).ThenInclude(f => f!.Publisher).ThenInclude(p => p.Image)
            .Include(w => w.Series).ThenInclude(s => s!.Image)
            .Include(w => w.Series).ThenInclude(s => s!.Franchise).ThenInclude(f => f.Image)
            .Include(w => w.Series).ThenInclude(s => s!.Franchise).ThenInclude(f => f.Publisher).ThenInclude(p => p.Image)
            .Include(w => w.PreviousNumber).ThenInclude(pn => pn!.Cover)
            .Include(w => w.NextNumber).ThenInclude(nn => nn!.Cover)
            .Include(w => w.PersonByRoles).ThenInclude(pbr => pbr.Person)
            .Include(w => w.PersonByRoles).ThenInclude(pbr => pbr.Role)
            .Include(w => w.Tags).ThenInclude(tw => tw.Tag)
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Work?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Works
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<Work?> GetByIdWithNavigationAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _context.Works
            .AsNoTracking()
            .Include(w => w.PreviousNumber)
            .Include(w => w.NextNumber)
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Work>> GetRecommendedAsync(long? userId, string sortBy, CancellationToken cancellationToken = default)
    {
        var query = _context.Works
            .AsNoTracking()
            .Where(work => work.IsActive);

        if (userId.HasValue && userId.Value > 0)
        {
            query = query.Where(work => !_context.WorkReadingProgresses.Any(
                progress => progress.Work != null && progress.Work.Id == work.Id && progress.User != null && progress.User.Id == userId.Value));
        }

        query = ApplyRecommendedOrdering(query, sortBy);

        return await query
            .Include(work => work.WorkType)
            .Include(work => work.Cover)
            .Include(work => work.Publisher)
            .Include(work => work.Franchise!)
            .ThenInclude(franchise => franchise.Publisher)
            .Include(work => work.Series!)
            .ThenInclude(series => series.Franchise!)
            .ThenInclude(franchise => franchise.Publisher)
            .AsSplitQuery()
            .Take(Application.Constants.RecommendedWorks.MaxResults)
            .ToListAsync(cancellationToken);
    }

    private IQueryable<Work> ApplyRecommendedOrdering(IQueryable<Work> query, string sortBy)
    {
        switch (sortBy)
        {
            case Application.Constants.RecommendedSortFields.MostPopular:
                return query
                    .OrderByDescending(work => _context.WorkReadingProgresses
                        .Where(progress => progress.Work != null && progress.Work.Id == work.Id)
                        .Sum(progress => (int?)progress.PercentageReading))
                    .ThenByDescending(work => work.CreatedAt)
                    .ThenByDescending(work => work.Id);

            case Application.Constants.RecommendedSortFields.MostRated:
                return query
                    .OrderByDescending(work => _context.WorkRatings.Count(
                        rating => rating.Work != null && rating.Work.Id == work.Id && rating.IsActive) > 0)
                    .ThenByDescending(work => _context.WorkRatings
                        .Where(rating => rating.Work != null && rating.Work.Id == work.Id && rating.IsActive)
                        .Average(rating => (double?)rating.Stars))
                    .ThenByDescending(work => work.CreatedAt)
                    .ThenByDescending(work => work.Id);

            default:
                return query
                    .OrderByDescending(work => work.CreatedAt)
                    .ThenByDescending(work => work.Id);
        }
    }

    public async Task AddAsync(Work work, CancellationToken cancellationToken = default)
    {
        await _context.Works.AddAsync(work, cancellationToken);
    }

    public async Task UpdateAsync(Work work, CancellationToken cancellationToken = default)
    {
        _context.Works.Update(work);
        await Task.CompletedTask;
    }

    private static IQueryable<Work> ApplyCatalogSearch(IQueryable<Work> query, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var pattern = $"%{search.Trim()}%";

        return query.Where(w =>
            EF.Functions.Like(w.Title, pattern) ||
            (w.Description != null && EF.Functions.Like(w.Description, pattern)) ||
            (w.NumberValue != null && EF.Functions.Like(w.NumberValue, pattern)) ||
            w.Tags.Any(t => EF.Functions.Like(t.Tag.Name, pattern)) ||
            w.PersonByRoles.Any(p => EF.Functions.Like(p.Person.Name, pattern)));
    }

    private static IQueryable<Work> ApplyCatalogHierarchy(IQueryable<Work> query, long? publisherId, long? franchiseId, long? seriesId)
    {
        query = ApplyPublisherFilter(query, publisherId);
        query = ApplyFranchiseFilter(query, franchiseId);

        if (seriesId.HasValue)
        {
            query = query.Where(w => w.Series != null && w.Series.Id == seriesId.Value);
        }

        return query;
    }

    private static IQueryable<Work> ApplyPublisherFilter(IQueryable<Work> query, long? publisherId)
    {
        if (!publisherId.HasValue)
        {
            return query;
        }

        return query.Where(w =>
            (w.Publisher != null && w.Publisher.Id == publisherId.Value) ||
            (w.Franchise != null && w.Franchise.Publisher.Id == publisherId.Value) ||
            (w.Series != null && w.Series.Franchise.Publisher.Id == publisherId.Value));
    }

    private static IQueryable<Work> ApplyFranchiseFilter(IQueryable<Work> query, long? franchiseId)
    {
        if (!franchiseId.HasValue)
        {
            return query;
        }

        return query.Where(w =>
            (w.Franchise != null && w.Franchise.Id == franchiseId.Value) ||
            (w.Series != null && w.Series.Franchise.Id == franchiseId.Value));
    }

    private static IQueryable<Work> ApplyWorkTypeFilter(IQueryable<Work> query, long? workTypeId)
    {
        return workTypeId.HasValue
            ? query.Where(w => w.WorkType != null && w.WorkType.Id == workTypeId.Value)
            : query;
    }

    private static IQueryable<Work> ApplyCatalogOrdering(IQueryable<Work> query, string? orderBy, string orderDir)
    {
        var descending = string.Equals(orderDir, SortDirection.DESC, StringComparison.OrdinalIgnoreCase);

        IOrderedQueryable<Work> ordered = orderBy?.ToLowerInvariant() switch
        {
            OrderByTitle => descending ? query.OrderByDescending(w => EF.Functions.Collate(w.Title, CaseInsensitiveCollation)) : query.OrderBy(w => EF.Functions.Collate(w.Title, CaseInsensitiveCollation)),
            OrderByPublicationDate => descending ? query.OrderByDescending(w => w.PublicationDate) : query.OrderBy(w => w.PublicationDate),
            OrderByNumber => OrderByNumberValue(query, descending),
            _ => descending ? query.OrderByDescending(w => w.CreatedAt) : query.OrderBy(w => w.CreatedAt)
        };

        return ordered.ThenBy(w => w.Id);
    }

    private static IOrderedQueryable<Work> OrderByNumberValue(IQueryable<Work> query, bool descending)
    {
        return descending
            ? query.OrderByDescending(w => EF.Functions.Collate(w.NumberValue, CaseInsensitiveCollation))
            : query.OrderBy(w => EF.Functions.Collate(w.NumberValue, CaseInsensitiveCollation));
    }

    private static IQueryable<Work> ApplyOrdering(IQueryable<Work> query, string? orderBy, string orderDir)
    {
        var descending = string.Equals(orderDir, "DESC", StringComparison.OrdinalIgnoreCase);

        return orderBy?.ToLowerInvariant() switch
        {
            "title" => descending ? query.OrderByDescending(w => EF.Functions.Collate(w.Title, CaseInsensitiveCollation)) : query.OrderBy(w => EF.Functions.Collate(w.Title, CaseInsensitiveCollation)),
            "publicationdate" => descending ? query.OrderByDescending(w => w.PublicationDate) : query.OrderBy(w => w.PublicationDate),
            "createdat" => descending ? query.OrderByDescending(w => w.CreatedAt) : query.OrderBy(w => w.CreatedAt),
            "language" => descending ? query.OrderByDescending(w => w.Language!.Name) : query.OrderBy(w => w.Language!.Name),
            "number" => descending
                ? query.OrderByDescending(w => EF.Functions.Collate(w.NumberValue, "utf8mb4_0900_ai_ci"))
                : query.OrderBy(w => EF.Functions.Collate(w.NumberValue, "utf8mb4_0900_ai_ci")),
            _ => descending ? query.OrderByDescending(w => w.CreatedAt) : query.OrderBy(w => w.CreatedAt)
        };
    }
}