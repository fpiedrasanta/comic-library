# Repositories — Catalog

EF Core repositories for catalog entities: countries, publishers, franchises, series, languages, persons, roles, tags, work types, and works.

## Conventions

- Every read-only query ends with `.AsNoTracking()`.
- Every query with 3 or more `Include`/`ThenInclude` calls uses `.AsSplitQuery()` to avoid Cartesian explosion.
- Every FK column has a corresponding `HasIndex` in the EF configuration. Shadow FKs use the `HasIndex("ColumnName")` string overload.
- No `IQueryable<T>` is exposed in interfaces. Repositories return `Task<T>`, `Task<(IReadOnlyList<T>, int)>`, or already-materialized DTOs.
- No `DbSet.Remove` / `DbSet.RemoveRange`. Deactivation uses `IsActive = false`.

## CountryRepository

- **Interface**: `ICountryRepository`
- **Location**: `Infrastructure/Repositories/CountryRepository.cs`
- **Operations**: `GetByIdAsync`, `GetPagedAsync` (nullable `isActive` filter; service layer decides), `GetByCodeAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: No global `IsActive = true` filter. Service layer decides filter per use case. `AsNoTracking` for reads. Search covers Code and Name (case-insensitive partial). **Index**: `Code` (unique), `Name` (unique).

## PublisherRepository

- **Interface**: `IPublisherRepository`
- **Location**: `Infrastructure/Repositories/PublisherRepository.cs`
- **Operations**: `GetByIdAsync`, `GetDetailByIdAsync` (read-only detail: `AsNoTracking` + `Include` of Country and Image), `GetPagedAsync` (nullable `isActive`, `isFeatured`, `isAlive` filters), `GetCatalogPagedAsync` (public card listing, see below), `GetByNameAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: No global `IsActive = true` filter. Service layer decides. `AsNoTracking` for reads. `GetByIdAsync` is the write-path read (used by update/deactivate/activate, which mutate the entity), so it deliberately keeps change tracking and relies on lazy-loading proxies. `GetDetailByIdAsync` is the read-only detail query: `AsNoTracking`, single round trip, and only the `Country` and `Image` navigations needed to build the Public Web publisher detail — no N+1 and no full entity graph. Search covers Name and Country.Name (case-insensitive partial). Name uniqueness at DB level. Image and Country validated at application level. Ordering by Name and Country.Name only, with an `Id` tie-breaker so pagination is stable. **Indexes**: `Name` (unique), `CountryId` (added 2026-09), `ImageId` (added 2026-09).

## FranchiseRepository

- **Interface**: `IFranchiseRepository`
- **Location**: `Infrastructure/Repositories/FranchiseRepository.cs`
- **Operations**: `GetByIdAsync`, `GetDetailByIdAsync` (read-only detail: `AsNoTracking` + `Include` of Image and Publisher), `GetPagedAsync` (optional `publisherId` filter, nullable `isActive`, `isFeatured`, `isOngoing` filters), `GetCatalogPagedAsync` (public card listing, see below), `AddAsync`, `UpdateAsync`
- **Notes**: No global `IsActive = true` filter. Service layer decides. `AsNoTracking` for reads. `GetByIdAsync` is the write-path read (used by update/deactivate/activate, which mutate the entity), so it deliberately keeps change tracking. `GetDetailByIdAsync` is the read-only detail query for the Public Web franchise header: `AsNoTracking`, single round trip, and only the `Image` and `Publisher` navigations needed to build the image URL and the publisher fields — no N+1 and no full entity graph (the paged query additionally loads Publisher.Country, which the detail does not need). Search covers Name, Publisher.Name, and Publisher.Country.Name (case-insensitive partial). `publisherId` restricts the result to the franchises of that publisher and combines with `search` using AND; the administrative call passes `null`, the public catalog call forwards its optional filter. Ordering by Name, PublisherCountry, and PublisherName only, with an `Id` tie-breaker so pagination is stable. Loads Publisher, Publisher.Country, and Image to avoid N+1. **Indexes**: `Name`, `IsActive`, `IsFeatured`, `IsOngoing`, `PublisherId` (added 2026-09).

## SeriesRepository

- **Interface**: `ISeriesRepository`
- **Location**: `Infrastructure/Repositories/SeriesRepository.cs`
- **Operations**: `GetByIdAsync`, `GetDetailByIdAsync` (read-only detail: `AsNoTracking` + `Include` of Image, Franchise and Franchise.Publisher), `GetPagedAsync` (nullable `publisherId`, `franchiseId`, `isActive`, `isFeatured`, `isOngoing` filters), `GetCatalogPagedAsync` (public card listing, see below), `ExistsAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: No global `IsActive = true` filter. Service layer decides. `AsNoTracking` for reads. `GetByIdAsync` is the write-path read (used by update/deactivate/activate, which mutate the entity), so it deliberately keeps change tracking. `GetDetailByIdAsync` is the read-only detail query for the Public Web series page: `AsNoTracking`, single round trip, and only the `Image`, `Franchise` and `Franchise.Publisher` navigations needed to build the header — no N+1 and no full entity graph. Unlike the paged query it does not load `Franchise.Publisher.Country`, which the public detail does not return. Search covers Name, Franchise.Name, and Franchise.Publisher.Name (case-insensitive partial). Ordering by Name, Franchise, Publisher, and Country only, with an `Id` tie-breaker so pagination is stable. The paged query loads Franchise, Franchise.Publisher, Franchise.Publisher.Country, Franchise.Image, and Image to avoid N+1. **Indexes**: `Name`, `IsActive`, `IsFeatured`, `IsOngoing`, `FranchiseId`, `ImageId`.

## GetCatalogPagedAsync (public card listings)

Added 2026-10 for US-0026. One method per catalog repository, all with the same signature:

```csharp
Task<(IReadOnlyList<TEntity>, int)> GetCatalogPagedAsync(int currentPage, int pageSize, string? search, CancellationToken cancellationToken = default)
```

- **Purpose**: single query per entity behind `GET /api/catalog/publishers|franchises|series`. They are separate operations from `GetPagedAsync` because the administrative query accepts a frontend-supplied `orderBy`/`orderDir`, optional `isFeatured`/`isOngoing`/`isAlive` filters, and a wider search; the public listing has none of those and must not be steerable by the client.
- **Visibility**: `AsNoTracking` + a global `IsActive = true` filter. The whole chain must be active, so a Franchise is listed only when its Publisher is active and a Series only when its Franchise and its Publisher are active. Because `Franchise.Publisher` and `Series.Franchise` are required FKs, these conditions translate to inner joins and the parent navigation is never null in the result.
- **Search**: partial `LIKE` over the entity's own `Name` and the parent names (`Franchise.Name` / `Publisher.Name` for Franchise; `Series.Name` / `Franchise.Name` / `Publisher.Name` for Series), combined with `OR`. Case-insensitivity comes from the column collation, as in the rest of the project. `Publisher` does not search `Country.Name` — that belongs to the administrative and filter queries.
- **Ordering**: always `Name` ascending with an `Id` tie-breaker, so pagination is stable. There is no ordering parameter by design.
- **Loading**: only the navigations needed to build a card. Publisher: `Image`. Franchise: `Image`, `Publisher`. Series: `Image`, `Franchise`, `Franchise.Publisher` with `AsSplitQuery` (3 includes). Filters, ordering, search and counting all run in the database; nothing is materialized to filter or sort in memory.
- **Returns**: `Task<(IReadOnlyList<TEntity>, int)>` — materialized entities plus total count. Mapping to the API contract is the Service responsibility.

## LanguageRepository

- **Interface**: `ILanguageRepository`
- **Location**: `Infrastructure/Repositories/LanguageRepository.cs`
- **Operations**: `GetByIdAsync`, `GetAllAsync`
- **Notes**: Simple repository for Language entity. No CRUD - data seeded directly in DB. **Indexes**: `Code` (unique), `Name` (unique).

## PersonRepository

- **Interface**: `IPersonRepository`
- **Location**: `Infrastructure/Repositories/PersonRepository.cs`
- **Operations**: `GetPagedAsync` (search by name), `GetByIdAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: `AsNoTracking` for reads. Search by name (case-insensitive partial). Name not unique at DB level. **Index**: `Name`.

## RoleRepository

- **Interface**: `IRoleRepository`
- **Location**: `Infrastructure/Repositories/RoleRepository.cs`
- **Operations**: `GetPagedAsync` (search by name, nullable `isActive` filter, optional `orderBy`/`orderDir`), `GetByIdAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: `AsNoTracking` for reads. Search by name (case-insensitive partial). Name unique at DB level. `IsActive` filter is nullable; when null, no filter is applied. Ordering by Name (default ASC) or CreatedAt. **Index**: `Name` (unique).

## TagRepository

- **Interface**: `ITagRepository`
- **Location**: `Infrastructure/Repositories/TagRepository.cs`
- **Operations**: `GetByIdAsync`, `GetByNameAsync`, `GetPagedAsync` (search by name), `AddAsync`
- **Notes**: Name unique at DB level. `AsNoTracking` for reads. Used by the Work editor autocomplete via `AdminTagsController`. **Index**: `Name` (unique).

## ListTypeRepository

- **Interface**: `IListTypeRepository`
- **Location**: `Infrastructure/Repositories/ListTypeRepository.cs`
- **Operations**: `GetPagedAsync` (search by name, nullable `isActive` filter, optional `orderBy`/`orderDir`), `GetByIdAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: `AsNoTracking` for reads. Search by name (case-insensitive partial). Name unique at DB level. `IsActive` filter is nullable; when null, no filter is applied. Ordering by Name (default ASC) or CreatedAt. **Index**: `Name` (unique).

## WorkListRepository

- **Interface**: `IWorkListRepository`
- **Location**: `Infrastructure/Repositories/WorkListRepository.cs`
- **Operations**: 
  - `GetPagedAsync` (official `System` lists only; search by list name, work title, and work number; filters by franchise, publisher, list type, active state, and UTC creation range; ordering by name or creation date; pagination)
  - `GetCatalogPagedAsync` (public catalog query: active `System` lists only, partial `LIKE` search across Name and Description, hierarchical publisher/franchise/series filters, optional listTypeId filter, ordering by name or creation date with Id tie-breaker, pagination. Added 2026-10 for US-0034: accepts the optional `long? userId` of the authenticated reader as the first parameter and projects, in the same SQL statement, `WorkCount` (`WorkListItems.Count`), `ReadingProgressPercentage`, and `AverageRating`. See "WorkList catalog reading progress" below.)
  - `GetCatalogByIdAsync` (fully loaded detail with WorkListItems ordered by Position, including Work, WorkType, Series.Franchise.Publisher, Franchise.Publisher, Publisher, and Work.Cover; `AsSplitQuery` + `AsNoTracking`. For US-0034 the per-Work reading progress is resolved by the Service through the batched `IWorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync`, so this query is unchanged.)
  - `GetByIdAsync` (fully loaded edit detail ordered by `Position`)
  - `GetByNameAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: `AsNoTracking` for all reads. The paged query includes `ListType` and `Cover` to avoid N+1 access and returns the cover metadata needed by the application. The detail query includes `Work`, `Franchise`, `Publisher`, `Series`, and work cover relationships with `AsSplitQuery`. WorkListItems are managed through the aggregate navigation by Application; no physical deletion is performed. **Indexes**: `Name`, `ListTypeId`, `CoverId`, `OwnerId`, `Visibility`, `IsActive`, `(WorkListId, WorkId)` unique, `(WorkListId, Position)` unique, plus the owner check constraint.

### WorkList catalog reading progress (US-0034)

- **Where**: inside the `GetCatalogPagedAsync` projection, so the whole page is resolved in a single SQL statement plus the pagination `COUNT`. No N+1.
- **`ReadingProgressPercentage`**: computed with a nested conditional that EF Core translates to `CASE WHEN` over correlated subqueries against `WorkReadingProgresses`. Rules: an empty list returns `0`; if the reader has no `WorkReadingProgress` for any Work of the list it returns `null`; otherwise it is `completedWorks * 100 / totalWorks`, where `completedWorks` counts the list items whose Work has a `WorkReadingProgress` in `ReadingState.Completed` for that user. When `userId` is `null` the equality never matches, so the result is `null` for anonymous readers.
- **`AverageRating` / `RatingCount`**: read from the persisted `WorkList` accumulators. When `RatingCount == 0` the exposed average is `null`. `ListRating` rows are never queried to recompute them.

## WorkRepository

- **Interface**: `IWorkRepository`
- **Location**: `Infrastructure/Repositories/WorkRepository.cs`
- **Operations**: `GetPagedAsync` (search by title/number, filters by workTypeId, isActive, languageId, contentStatus, publicationDateFrom/To, publisherId, franchiseId, seriesId, nullable `iaRequest`, nullable `iaResponse`, and nullable `withDescription`; ordering by title, publicationDate, createdAt, language, number; pagination), `GetCatalogPagedAsync` (public catalog query for authenticated readers: active works only, partial `LIKE` search across Title, Description, NumberValue, Tags and Person (any role), hierarchical publisher/franchise/series filters, optional workTypeId filter, ordering by title, publicationDate, createdAt (`uploadedat` alias) or number with Id tie-breaker, pagination), `GetCatalogByIdAsync` (public detail query: active work by Id, eager loads Cover, Language, WorkType, Publisher/Image, Franchise/Image/Publisher/Image, Series/Image/Franchise/Image/Publisher/Image, PreviousNumber/Cover, NextNumber/Cover, PersonByRoles/Person/Role, Tags/Tag; `AsSplitQuery` + `AsNoTracking`), `GetByIdAsync` (fully loaded with all relationships, **`AsSplitQuery` + `AsNoTracking`**), `GetRecommendedAsync` (recommended works of one user: see below), `AddAsync`, `UpdateAsync`
- **Notes**: `AsNoTracking` for all reads. Single unified repository for all works (replaces former NumberRepository and GraphicNovelRepository). Filters by publisherId, franchiseId, seriesId (mutually exclusive hierarchy). `iaRequest` filters the boolean request state; `iaResponse` filters only existence (`true` = non-null, `false` = null) without parsing JSON; `withDescription` filters content presence (`true` = non-null and non-empty, `false` = null or empty). All nullable filters are optional and combine with existing filters before materialization. Ordering by Title, PublicationDate, CreatedAt, Language, Number (natural sort on NumberValue). Loads all relationships for detail query (WorkType, Series, Franchise, Publisher, Language, Cover, File, PersonByRoles, Tags, Pages, PreviousNumber, NextNumber) to avoid N+1. **Indexes**: `IsActive`, `LanguageId`, `PublicationDate`, `ContentStatus`, `CoverId`, `FileId`, `SeriesId`, `FranchiseId`, `PublisherId`, `WorkTypeId`, `PreviousNumberId`, `NextNumberId`.

### GetRecommendedAsync

- **Signature**: `GetRecommendedAsync(long? userId, string sortBy, CancellationToken)` → `IReadOnlyList<Work>`.
- **Responsibilities**: returns up to 12 works recommended for a user. `AsNoTracking` + `AsSplitQuery` with the same includes as `GetCatalogPagedAsync` (WorkType, Cover, Publisher, Franchise/Publisher, Series/Franchise/Publisher) so the service can map the catalog `WorkCard` without extra queries.
- **Eligibility**: active works only; when a `userId` is provided, works with any `WorkReadingProgress` of that user are excluded (opened at page 1 or completed alike), so only works the user has not started are recommended. Without `userId` no progress is excluded.
- **Ordering (every criterion ends with `CreatedAt` descending and `Id` descending as tie-breakers)**: `MostPopular` orders by the weighted reading progress `SUM(PercentageReading)` of the work, descending (EF computes the sum inside the correlated subquery, so works without progress rank last with 0); `RecentlyAdded` orders by `CreatedAt` descending; `MostRated` first separates works with at least one active rating from the unrated ones, then orders by the average of `WorkRating.Stars` over active ratings (zero-star votes included), descending.
- **Limit**: `Take(12)` is applied in the database after filtering and ordering (`RecommendedWorks.MaxResults`).

### GetCatalogPagedAsync

- **Purpose**: single query used by the public catalog (`GET /api/works`). It is a separate operation because the administrative query resolves hierarchy by direct FK only and must expose inactive works and IA filters.
- **Hierarchy**: `publisherId` matches works assigned directly to the publisher plus works whose `Franchise` belongs to it plus works whose `Series.Franchise` belongs to it. `franchiseId` matches works assigned directly to the franchise plus works whose `Series` belongs to it. `seriesId` matches works assigned to that series. Filters combine with `AND`. `WorkType` never participates in membership resolution.
- **Search**: partial and case-insensitive (`utf8mb4_0900_ai_ci`) over `Work.Title`, `Work.Description`, `Work.NumberValue`, `Work.Tags[].Tag.Name` and `Work.PersonByRoles[].Person.Name` (role independent). Tags and Persons are resolved with `Any` subqueries, never with in-memory filtering.
- **Ordering**: `Title`, `PublicationDate`, `CreatedAt` (public alias `UploadedAt`), `Number`. Default `CreatedAt DESC`. Unknown or missing values fall back to the default. A `ThenBy(Id)` tie-breaker keeps pagination stable across pages.
- **Loading**: `AsNoTracking` + `AsSplitQuery` with `WorkType`, `Cover`, `Publisher`, `Franchise.Publisher` and `Series.Franchise.Publisher`. Only relationships required to present a catalog card are loaded, so no N+1 and no full entity graph per page.
- **Returns**: `Task<(IReadOnlyList<Work>, int)>` — materialized entities plus total count. Mapping to the API contract is the Service responsibility.

### GetCatalogByIdAsync

- **Purpose**: single query used by the public work detail (`GET /api/works/{id}`). It is a separate operation because the administrative `GetByIdAsync` resolves hierarchy by direct FK only and does not eager-load all relationships needed for the public detail page.
- **Availability**: returns only active works (`IsActive = true`). Inactive or non-existent works return `null`.
- **Hierarchy**: eager-loads `Publisher` → `Image`, `Franchise` → `Image` → `Publisher` → `Image`, `Series` → `Image` → `Franchise` → `Image` → `Publisher` → `Image`. The Service resolves the actual context using the same fallback chain as the catalog: `work.Publisher` → `work.Franchise?.Publisher` → `work.Series?.Franchise?.Publisher`.
- **Loading**: `AsNoTracking` + `AsSplitQuery` with `Cover`, `Language`, `WorkType`, all context images, `PreviousNumber` → `Cover`, `NextNumber` → `Cover`, `PersonByRoles` → `Person`/`Role`, `Tags` → `Tag`. No N+1.
- **Returns**: `Task<Work?>` — materialized entity or `null`. Mapping to the API contract is the Service responsibility.

## WorkTypeRepository

- **Interface**: `IWorkTypeRepository`
- **Location**: `Infrastructure/Repositories/WorkTypeRepository.cs`
- **Operations**: `GetPagedAsync`, `GetByIdAsync`, `GetByNameAsync`, `AddAsync`, `UpdateAsync`, `ExistsAsync`, `IsActiveAsync`
- **Notes**: `AsNoTracking` for reads. Simple catalog repository for work type classification. Name unique at DB level. Search covers Name (case-insensitive partial); ordering by Name, CreatedAt and IsActive with an `Id` tie-breaker so pagination is stable. **Indexes**: `Name` (unique), `IsActive`.

## WorkRatingRepository

- **Interface**: `IWorkRatingRepository`
- **Location**: `Infrastructure/Repositories/WorkRatingRepository.cs`
- **Operations**: `GetByIdAsync`, `GetByUserIdAndWorkIdAsync`, `GetPagedByWorkIdAsync`, `AddAsync`, `UpdateAsync`
- **Notes**: Explicit repository for the votes/reviews of a Work (`WorkRating`). Single-entity lookups (`GetByIdAsync`, `GetByUserIdAndWorkIdAsync`) are **tracked** (no `AsNoTracking`, no `Include`) so the Service can mutate the returned entity and rely on lazy loading for the `User` and `Work` navigations. `GetPagedByWorkIdAsync` is read-only: `AsNoTracking`, `Include(User)` + `ThenInclude(Avatar)` so the listing can present the voter identity without N+1, filter by `Work` and active ratings, ordering by `Stars` or `CreatedAt` in both directions with an `Id` tie-breaker for deterministic pagination, and pagination applied in the database before materialization. Zero-star votes are ordinary rows and are never excluded. The pair (User, Work) is unique at DB level (`IX_WorkRatings_WorkId_UserId`), so at most one rating exists per user and Work. Repositories never compute the rating accumulators; that is `WorkRatingService` responsibility. **Atomic accumulator updates**: `ApplyNewVoteToWorkAccumulatorsAsync` and `ApplyScoreChangeToWorkAccumulatorsAsync` execute a single parameterized `UPDATE Works` statement (`ExecuteSqlRawAsync`, no string concatenation of user data) so the formulas are evaluated by the database against the stored values, which is what makes concurrent votes safe. In both statements `AverageRating` is assigned before `RatingCount`, because MySQL evaluates `SET` assignments left to right. `Detach` releases an entity from the change tracker so a rejected insert can be retried as an edit. **Indexes**: `(WorkId, UserId)` (unique).