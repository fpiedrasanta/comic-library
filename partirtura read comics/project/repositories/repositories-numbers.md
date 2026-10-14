# Repositories — Numbers & Content

EF Core repositories for numbers, pages, works, and the Unit of Work.

## Conventions

- Every read-only query ends with `.AsNoTracking()`.
- Every query with 3 or more `Include`/`ThenInclude` calls uses `.AsSplitQuery()` to avoid Cartesian explosion.
- Every FK column has a corresponding `HasIndex` in the EF configuration. Shadow FKs use the `HasIndex("ColumnName")` string overload.
- No `IQueryable<T>` is exposed in interfaces. Repositories return `Task<T>`, `Task<(IReadOnlyList<T>, int)>`, or already-materialized DTOs.
- No `DbSet.Remove` / `DbSet.RemoveRange`. Deactivation uses `IsActive = false`.

## NumberRepository

- **Interface**: `INumberRepository`
- **Location**: `Infrastructure/Repositories/NumberRepository.cs`
- **Operations**: `GetPagedAsync` (search by number/title, filters by seriesId, isActive, languageId, contentStatus, publicationDateFrom/To), `GetByIdAsync`, `GetDetailByIdAsync` (with all relationships, **`AsSplitQuery` + `AsNoTracking`** — 9 includes), `GetBySeriesAndNumberAsync`, `GetWithPagesAsync` (loads Pages + Image, `AsNoTracking`), `AddAsync`, `UpdateAsync`
- **Notes**: `AsNoTracking` for all reads (added 2026-09). Ordering by Number (natural sort: `NaturalPrefix(NumberValue) ASC, NaturalFirstNumber(NumberValue) ASC, NumberValue ASC`), Title, PublicationDate, CreatedAt, Language. Loads all relationships for detail query to avoid N+1. `GetWithPagesAsync` is used by the CBR/CBZ upload flow to list page images and to validate that a cover or AI image belongs to the Number. **`GetDetailByIdAsync` uses `AsSplitQuery()` (added 2026-09) to prevent Cartesian explosion across TagByNumbers × PersonByRoles × Pages**. **Indexes**: `(SeriesId, NumberValue)` (unique), `IsActive`, `LanguageId`, `PublicationDate`, `ContentStatus`, `CoverId` (added 2026-09).

## PageRepository

- **Interface**: `IPageRepository`
- **Location**: `Infrastructure/Repositories/PageRepository.cs`
- **Operations**: `GetByWorkIdAsync` (ordered by Order), `GetByNumberIdAsync` (backward compatibility), `DeleteByWorkIdAsync`, `DeleteByNumberIdAsync` (backward compatibility), `AddAsync`, `Remove(Page)` (added 2026-09 for `CbrProcessingJob` cleanup)
- **Notes**: Used by `CbrProcessingJob` for idempotent content cleanup and re-creation. Cleanup is paired with `IImageRepository.Remove` and `IFileStorageService.DeleteAsync` to ensure no orphan entities or files. Works with any `Work` (Number or GraphicNovel). **Index**: `(WorkId, Order)` (unique).

## WorkReadingProgressRepository

- **Interface**: `IWorkReadingProgressRepository`
- **Location**: `Infrastructure/Repositories/WorkReadingProgressRepository.cs`
- **Operations**: `GetByWorkIdAndUserIdAsync` (tracked entity for updates), `GetByWorkIdsAndUserIdAsync` (batch read for a page of works), `GetPagedHistoryByUserIdAsync` (paginated reading history of a user), `AddAsync`
- **Notes**: `GetByWorkIdAndUserIdAsync` returns a tracked entity (no `AsNoTracking`) to allow direct updates, with no `Include()` for navigation properties (lazy loading is used). `GetByWorkIdsAndUserIdAsync` returns the progresses of one user restricted to the received work ids in a **single query**: it is read-only (`AsNoTracking`), includes `Work` so the caller can key by work without lazy loading, returns an empty list without touching the database when the id collection is empty, and never returns progresses of other users or of works outside the requested ids. `GetPagedHistoryByUserIdAsync` returns `(IReadOnlyList<WorkReadingProgress>, int TotalCount)` for the reading history of one user: read-only (`AsNoTracking`), optional filter by `ReadingState` (`null` = no filter), restricted to **active** works so the visibility rules of the catalog are respected, ordered by `LastReadAt` descending with `Id` as tie-breaker, and paginated in the database (`Skip`/`Take`); a single `AsSplitQuery` query with the same includes as the catalog (`Work.WorkType`, `Work.Cover`, `Work.Publisher`, `Work.Franchise.Publisher`, `Work.Series.Franchise.Publisher`) resolves everything needed to build the `WorkCard` without per-record queries. Unique index on `(WorkId, UserId)`. Added 2026-10.

## UnitOfWork

- **Interface**: `IUnitOfWork`
- **Location**: `Infrastructure/Repositories/UnitOfWork.cs`
- **Operations**: `SaveChangesAsync`, `BeginTransAsync`, `CommitAsync`
- **Repository Properties**: `NumberRepository`, `GraphicNovelRepository`, `SeriesRepository`, `FranchiseRepository`, `PublisherRepository`, `PersonRepository`, `RoleRepository`, `TagRepository`, `LanguageRepository`, `ImageRepository`, `PageRepository`, `WorkReadingProgressRepository`
- **Notes**: Use when multiple repository operations must commit atomically. Rollback handled automatically by `Dispose` when transaction not committed. Repository instances are lazily created on first access.