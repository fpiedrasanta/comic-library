# Services — Catalog

Application services for catalog and content management.

## CountryService

- **Location**: `Application/Services/CountryService.cs`
- **Controller**: `AdminCountriesController`, `CountriesController`
- **Dependencies**: `ICountryRepository`, `IUnitOfWork`
- **Operations**: Active countries for public, paginated admin lists, create, update, deactivate, activate
- **Notes**: Validates Code and Name uniqueness. No physical deletion. `GetPagedAsync` accepts nullable `isActive`; service layer decides filter.

## PublisherService

- **Location**: `Application/Services/PublisherService.cs`
- **Controller**: `AdminPublishersController`, `PublishersController`
- **Dependencies**: `IPublisherRepository`, `ICountryRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, **public catalog filters** (`GetPublicPagedAsync` — active only, search, ordering, pagination capped to 24, returns `PublisherFilterDto`), **public catalog card listing** (`GetCatalogPagedAsync` — accepts `GetCatalogPublishersRequest`, active only, search by own name, pagination normalized to 24 by default and capped to 36, returns `CatalogPublisherCardDto`), **public detail** (`GetPublicDetailAsync` — returns `PublisherDetailDto` for the Public Web publisher page; `404` when the publisher does not exist or is inactive), detail, create, update, deactivate, activate
- **Notes**: `GetCatalogPagedAsync` (US-0026) is a distinct contract from `GetPublicPagedAsync` and from the administrative list: it exposes exactly `Id`, `Name`, `Color` and `UrlImage`, takes no ordering parameter, and never exposes `IsActive`, `IsFeatured`, `IsAlive`, `CreatedAt` or `CountryName`. Ordering is fixed to `Name` ascending inside the repository. It normalizes paging with `PaginationGuard.Normalize` and builds the response with `PaginationGuard.Build`, so out-of-range values are corrected rather than rejected. It does not reuse `PublisherFilterDto` because a card needs the logo URL that the filter contract omits.
- **Notes**: Validates name uniqueness, country existence/active (when provided), hex color format `#RRGGBB`. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete. Country optional. Ordering by Name and Country.Name only. `GetPublicPagedAsync` forces `IsActive = true`, exposes only `Id`, `Name` and `Color`, and never returns administrative fields. `GetPublicDetailAsync` validates `publisherId > 0`, resolves the entity with `PublisherRepository.GetDetailByIdAsync`, raises `BusinessNotFoundException` when it is null or `IsActive = false` (same message in both cases, so existence of a deactivated id is not disclosed), builds the logo URL with `ImageUrlBuilder.ToUrl` and the country name with the domain helper `GetCountryName()`. The public DTO exposes `Id`, `Name`, `Color`, `UrlImage`, `CountryName`, `FoundedYear`, `Website`, `Description` and `History`; it never exposes `IsActive`, `IsFeatured`, `IsAlive`, `CreatedAt`, foreign keys or storage data, and it reuses no administrative DTO.

## FranchiseService

- **Location**: `Application/Services/FranchiseService.cs`
- **Controller**: `AdminFranchisesController`, `FranchisesController`
- **Dependencies**: `IFranchiseRepository`, `IPublisherRepository`, `ICountryRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, **public catalog filters** (`GetPublicPagedAsync` — active only, optional `PublisherId`, search, ordering, pagination capped to 24, returns `FranchiseFilterDto`), **public catalog card listing** (`GetCatalogPagedAsync` — accepts `GetCatalogFranchisesRequest`, active franchise with active publisher, search by own name or publisher name, pagination normalized to 24 by default and capped to 36, returns `CatalogFranchiseCardDto`), **public detail** (`GetPublicDetailAsync` — returns `PublicFranchiseDetailDto` for the Public Web franchise page; `404` when the franchise does not exist or is inactive), detail, create, update, deactivate, activate
- **Notes**: `GetCatalogPagedAsync` (US-0026) is a distinct contract from `GetPublicPagedAsync` and from the administrative list: it exposes exactly `Id`, `Name`, `Color`, `UrlImage` and a nested `Publisher` node with `Id`, `Name` and `Color`, so the Public Web card can render its publisher pill and navigate to `/publishers/{id}` without a second request. It takes no ordering parameter, never exposes `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt` or `PublisherCountryName`, and its search is the entity name OR the publisher name only. The whole chain must be active, which the repository enforces in SQL, so `f.Publisher` is never null here and the node is declared non-nullable; `Franchise.PublisherId` is a required foreign key, so no valid row can break it. Ordering is fixed to `Name` ascending inside the repository. Paging is normalized with `PaginationGuard.Normalize` and the response built with `PaginationGuard.Build`.
- **Notes**: Validates name required, publisher existence/active, hex color format `#RRGGBB`. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete. IsActive cannot be modified through create/update (only via activate/deactivate). Ordering by Name, PublisherCountry, PublisherName only. `GetPublicPagedAsync` forces `IsActive = true` and exposes only `Id`, `Name`, `Color`, `PublisherId` and `PublisherName`. `GetPublicPagedAsync` accepts `GetPublicFranchisesRequest` (ListRequest + `PublisherId`); an unknown `PublisherId` yields an empty list, never a 404, since it is a filter. `GetPublicDetailAsync` validates `franchiseId > 0`, resolves the entity with `FranchiseRepository.GetDetailByIdAsync`, raises `BusinessNotFoundException` when it is null or `IsActive = false` (same message in both cases, so existence of a deactivated id is not disclosed), and builds the image URL with `ImageUrlBuilder.ToUrl`. The public DTO exposes `Id`, `Name`, `Description`, `Color`, `UrlImage`, `PublisherId`, `PublisherName` and `PublisherColor`; it never exposes `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt`, `PublisherCountryName` or storage data. The publisher fields come from the loaded `Publisher` navigation via the domain helpers `GetPublisherId()` and `GetPublisherName()` plus `Publisher.Color`, and match the `publisherId`/`publisherName` returned by `GetPublicPagedAsync`. They are declared nullable, but `Franchise.PublisherId` is a required foreign key, so a franchise without publisher cannot exist and the null case is purely defensive. It is a distinct contract from the administrative `FranchiseDetailDto`, which is reused unchanged by the create/update/detail operations.

## SeriesService

- **Location**: `Application/Services/SeriesService.cs`
- **Controller**: `AdminSeriesController`, `SeriesController`
- **Dependencies**: `ISeriesRepository`, `IFranchiseRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, **public catalog filters** (`GetPublicPagedAsync` — active only, optional `PublisherId` and `FranchiseId`, search, ordering, pagination capped to 24, returns `SeriesFilterDto`), **public catalog card listing** (`GetCatalogPagedAsync` — accepts `GetCatalogSeriesRequest`, active series with active franchise and publisher, search by own name, franchise name or publisher name, pagination normalized to 24 by default and capped to 36, returns `CatalogSeriesCardDto`), **public detail** (`GetPublicDetailAsync` — returns `PublicSeriesDetailDto` for the Public Web series page; `404` when the series does not exist or is inactive), detail, create, update, deactivate, activate
- **Notes**: `GetCatalogPagedAsync` (US-0026) is a distinct contract from `GetPublicPagedAsync` and from the administrative list: it exposes exactly `Id`, `Name`, `Color`, `UrlImage` and two nested nodes, `Franchise` and `Publisher`, each with `Id`, `Name` and `Color`, so the Public Web card can render both pills and navigate without a second request. It takes no ordering parameter, never exposes `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt` or flat franchise/publisher ids, and its search is the three names combined with `OR`. The whole chain must be active, which the repository enforces in SQL, so `s.Franchise` and `s.Franchise.Publisher` are never null and the nodes are declared non-nullable; both are required foreign keys. Ordering is fixed to `Name` ascending inside the repository. Paging is normalized with `PaginationGuard.Normalize` and the response built with `PaginationGuard.Build`.
- **Notes**: Validates name required, franchise existence/active, hex color format `#RRGGBB`. `Description` is optional on create and update, stored with `?.Trim()` like Publisher and Franchise, so `null` clears it and surrounding whitespace is removed; no validation is applied to its content, and its absence never raises an error. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete. IsActive cannot be modified through create/update (only via activate/deactivate). No uniqueness constraint on Name. Ordering by Name, Franchise, Publisher, Country only. `GetPublicPagedAsync` forces `IsActive = true` and exposes only `Id`, `Name`, `Color`, `FranchiseId`, `FranchiseName`, `PublisherId` and `PublisherName`. `PublisherId` and `PublisherName` are resolved through `Series.Franchise.Publisher` (already loaded by the repository), so they are null when the series has no franchise. `GetPublicPagedAsync` accepts `GetPublicSeriesRequest` (ListRequest + `PublisherId` + `FranchiseId`); both combine with `search` using AND, both together require the franchise to belong to the publisher, and an unknown id yields an empty list rather than a 404. `GetPublicDetailAsync` validates `seriesId > 0`, resolves the entity with `SeriesRepository.GetDetailByIdAsync`, raises `BusinessNotFoundException` when it is null or `IsActive = false` (same message in both cases, so existence of a deactivated id is not disclosed), and builds the image URL with `ImageUrlBuilder.ToUrl`. The public DTO exposes `Id`, `Name`, `Description`, `Color`, `UrlImage` and two nested nodes, `Franchise` and `Publisher`, each carrying `Id`, `Name` and a nullable `Color`; it never exposes `IsActive`, `IsFeatured`, `IsOngoing`, `CreatedAt`, `ImageId`, flat franchise/publisher ids or storage data. The node colors were added in 2026-10 because the Public Web series header renders one pill per hierarchy level and needs each entity color. The nested nodes are built null-safe, so a missing relation yields `null` instead of an exception, but `Series.FranchiseId` and `Franchise.PublisherId` are both required foreign keys, so in practice they are always populated. It is a distinct contract from the administrative `SeriesDetailDto`, which is reused unchanged by the create/update/detail operations.

## WorkTypeService

- **Location**: `Application/Services/WorkTypeService.cs`
- **Controller**: `AdminWorkTypesController`, `WorkTypesController`
- **Dependencies**: `IWorkTypeRepository`, `IUnitOfWork`
- **Operations**: Paginated list (search by name, filter active state, order by name/createdAt/active, paginate), **public catalog filters** (`GetPublicPagedAsync` — active only, search, ordering, pagination capped to 24, returns `WorkTypeFilterDto`), get by Id, create, update name, deactivate, activate
- **Notes**: Validates name required and unique. Uses logical deletion via `IsActive`; deactivate and activate are idempotent. `GetPublicPagedAsync` forces `IsActive = true` and exposes only `Id` and `Name`.

## PersonService

- **Location**: `Application/Services/PersonService.cs`
- **Controller**: `AdminPersonsController`
- **Dependencies**: `IPersonRepository`, `IUnitOfWork`
- **Operations**: Paginated list (search by name), create
- **Notes**: Validates name required, name uniqueness. Returns PersonListItemDto with Id, Name, Biography.

## RoleService

- **Location**: `Application/Services/RoleService.cs`
- **Controller**: `AdminRolesController`
- **Dependencies**: `IRoleRepository`, `IUnitOfWork`
- **Operations**: Paginated list (search by name, filter IsActive, order, paginate), get by Id, create, update name, deactivate, activate
- **Notes**: Validates name required, name uniqueness. Returns `RoleListItemDto` with Id, Name, IsActive for lists. Throws `BusinessNotFoundException` for non-existent roles, `BusinessConflictException` for duplicate names, `ValidationException` for empty names. Uses logical deletion via `IsActive`.

## ListTypeService

- **Location**: `Application/Services/ListTypeService.cs`
- **Controller**: `AdminListTypesController`
- **Dependencies**: `IListTypeRepository`, `IUnitOfWork`
- **Operations**: Paginated list (search by name, filter IsActive, order, paginate), get by Id, create, update name, deactivate, activate
- **Notes**: Validates name required, name uniqueness. Returns `ListTypeListItemDto` with Id, Name, IsActive for lists. Throws `BusinessNotFoundException` for non-existent types, `BusinessConflictException` for duplicate names, `ValidationException` for empty names. Uses logical deletion via `IsActive`. Deactivation/reactivation are idempotent.

## WorkListService

- **Location**: `Application/Services/WorkListService.cs`
- **Controller**: `AdminWorkListsController`, `CatalogController`
- **Dependencies**: `IWorkListRepository`, `IWorkRepository`, `IListTypeRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: 
  - Administrative: Paginated list (search by name/work title/number, filters by franchise/publisher/list type/active status/date range, order by name/createdAt, paginate), get by Id (with full detail including works, franchise, publisher, series), create, update (including work items management: add/remove/reorder), deactivate, activate
  - Public catalog: `GetCatalogPagedAsync` (active `System` lists only, search by name or description, hierarchical publisher/franchise/series filters, optional listTypeId filter, ordering by name or createdAt with Id tie-breaker, pagination capped to 24/36), `GetCatalogByIdAsync` (fully loaded detail with works ordered by Position, exposing all fields needed for WorkCard; returns 404 when list does not exist or is inactive)
- **Notes**: Only manages System-owned lists (OwnerType = System, OwnerUserId = null). Validates name required/uniqueness, ListType existence/active status, hex color format `#RRGGBB`, work existence, no duplicate works in list, unique positions. Work items managed via `WorkListWorkItemRequest` (WorkId, Position). Cover image management integrated. Uses logical deletion via `IsActive`. Deactivation/reactivation are idempotent. Transactions ensure atomic updates of WorkList and WorkListItems. Public catalog methods delegate to `IWorkListRepository.GetCatalogPagedAsync` and `GetCatalogByIdAsync`, which load exactly the required navigations with `AsSplitQuery` to avoid N+1. Pagination uses `PaginationGuard.Normalize` and `PaginationGuard.Build`.

## WorkService

- **Location**: `Application/Services/WorkService.cs`
- **Controller**: `AdminWorksController`, `WorksController`
- **Dependencies**: `IWorkRepository`, `IWorkTypeRepository`, `ISeriesRepository`, `IFranchiseRepository`, `IPublisherRepository`, `IPersonRepository`, `IRoleRepository`, `ITagRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`, `IUserRepository`, `IWorkReadingProgressRepository`
- **Operations**: Paginated list (search by title/number, filters by workTypeId, isActive, languageId, contentStatus, publicationDateFrom/To, publisherId, franchiseId, seriesId, **iaRequest, iaResponse, withDescription**; ordering by title, publicationDate, createdAt, language, number; pagination), **catalog list** (`GetCatalogPagedAsync` — public catalog for authenticated readers: search, publisher/franchise/series/workType filters, ordering, pagination; returns `ListResponse<WorkCatalogItemDto>`; receives `long? userId` and enriches each item with `MyReadingProgress` when present), **public detail** (`GetCatalogByIdAsync` — returns `CatalogWorkDetailDto` for the Public Web work detail page; 404 when the work does not exist or is inactive; receives `long? userId` and, when present, includes the reading progress of that user as `MyReadingProgress`), get by Id (fully loaded), create, create with content, update, deactivate, activate, **Reader pages** (`GetReaderPagesAsync` — returns `ReaderWorkPagesDto` for the Reader with optional `CurrentPage` for authenticated user; 404 when the work does not exist or is inactive), **Reading progress** (`UpdateReadingProgressAsync` — idempotent upsert of user's last read page; `GetCurrentPageAsync` — query current page)
- **Notes**: Unified service for all works (replaces former NumberService and GraphicNovelService). Validates WorkType existence, hierarchy (exactly one of PublisherId, FranchiseId, SeriesId), language existence, series/franchise/publisher existence when provided. Manages PersonByRoles and Tags sync. Cover image management integrated. WorkType is classification only; no semantic rules based on WorkType. Uses logical deletion via `IsActive`. Deactivation/reactivation are idempotent. Transactions ensure atomic creation/update of Work and related entities. **Filters**: `iaRequest` (true/false/null = filter by IA request state), `iaResponse` (true/false/null = filter by existence of IA response), `withDescription` (true/false/null = filter by description content presence). All nullable filters are optional and combine with existing filters. **MyReadingProgress in the detail**: populated only when the service receives a `userId` (the controller passes the JWT `sub` claim; anonymous/missing claim leaves it `null`). The values are the ones persisted by `WorkReadingProgress` (`CurrentPage`, `TotalPages`, `PercentageReading`, `LastReadAt`, `State`), read through `IWorkReadingProgressRepository.GetByWorkIdAndUserIdAsync`; the detail never recalculates the percentage nor creates/modifies progress, and it skips the progress query when there is no user.
**MyReadingProgress in the catalog list**: when `GetCatalogPagedAsync` receives a `userId` and the page has items, it reads the ids of the page works and fetches their progresses with a single `IWorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync` call (never one query per work), keys them by `Work.Id` and maps each item with `ReaderMyProgressDto`. When there is no user, an anonymous request or an empty page, the batch query is not executed and every item reports `null`. The percentage is the stored `PercentageReading`, so the list and the detail always report the same value for the same work and user. The catalog query itself is unchanged (same repository operation, same filters, ordering and pagination).

### GetCatalogPagedAsync

- **Signature**: `GetCatalogPagedAsync(GetCatalogWorksRequest request, CancellationToken)` ? `ListResponse<WorkCatalogItemDto>`.
- **Responsibilities**: normalizes pagination with `PaginationGuard` (default page size 12, max 50), applies the catalog defaults (`orderBy = CreatedAt`, `orderDir = DESC`), delegates the query to `IWorkRepository.GetCatalogPagedAsync`, maps entities to `WorkCatalogItemDto` and builds the paginated response.
- **Mapping**: `WorkCatalogItemDto` exposes Id, WorkType, Title, Description, NumberValue, PublicationDate, CreatedAt, cover (id and url) and the effective `Series`, `Franchise` and `Publisher` nodes (`WorkCatalogNodeDto`: Id, Name, Color). The effective hierarchy is resolved through the domain helpers, so a work assigned to a Series also reports the Franchise and Publisher of that Series.
- **Boundaries**: the Service does not build LINQ queries, does not resolve hierarchy membership and does not filter in memory. Administrative fields (IsActive, ContentStatus, IA state) are not exposed.

### GetCatalogByIdAsync

- **Signature**: `GetCatalogByIdAsync(long id, CancellationToken)` ? `CatalogWorkDetailDto`.
- **Responsibilities**: delegates the query to `IWorkRepository.GetCatalogByIdAsync`, raises `BusinessNotFoundException` when the work is null or inactive (same message in both cases, so existence of a deactivated id is not disclosed), maps the entity to `CatalogWorkDetailDto` and builds all image URLs with `ImageUrlBuilder.ToUrl`.
- **Mapping**: `CatalogWorkDetailDto` exposes Id, context nodes (`Publisher`, `Franchise`, `Series` as `CatalogWorkContextDto`: Id, Name, Color, UrlCover), cover URL, NumberValue, Title, Description, Language (`LanguageDto`), WorkType (`WorkTypeFilterDto`), PublicationDate, navigation works (`PreviousWork`, `NextWork` as `CatalogWorkNavigationDto`: Id, Title, NumberValue, UrlCover), PersonAssignments (`PersonByRoleDto`), Tags (`TagDto`), `AverageRating` and `RatingCount`. Context nodes are resolved through the same fallback chain as the catalog: `work.Publisher` ? `work.Franchise?.Publisher` ? `work.Series?.Franchise?.Publisher`. Navigation works use only the explicit domain relationships `PreviousNumber` and `NextNumber`; no inference by number, date or order is performed. `AverageRating` and `RatingCount` are read from the `Work` accumulators maintained by `WorkRatingService`; the detail never queries the ratings table to recalculate them. A Work without votes returns `AverageRating = 0` and `RatingCount = 0`; zero-star votes are included in both accumulators.
- **Boundaries**: the Service does not build LINQ queries, does not resolve hierarchy membership and does not filter in memory. Administrative fields (IsActive, ContentStatus, IA state, FileId, PagesCount) are not exposed. Physical storage paths are never exposed.

### GetReaderPagesAsync

- **Signature**: `GetReaderPagesAsync(long workId, long? userId, CancellationToken)` ? `ReaderWorkPagesDto`.
- **Responsibilities**: validates `workId > 0`, resolves the Work with `IWorkRepository.GetByIdWithNavigationAsync`, raises `BusinessNotFoundException` when the work is null or inactive (same message in both cases, so existence of a deactivated id is not disclosed), delegates the page query to `IWorkRepository.PageRepository.GetByWorkIdAsync`, maps the pages to `ReaderPageDto` using `ImageUrlBuilder.ToUrl` for protected image URLs. If `userId` is provided, queries `IWorkReadingProgressRepository.GetByWorkIdAndUserIdAsync` to include the user's reading progress. Returns `ReaderWorkPagesDto` with the ordered collection and `CurrentPage` (nullable).
- **Mapping**: `ReaderWorkPagesDto` exposes `WorkId`, `PreviousWork`, `NextWork`, an ordered `Pages` collection, `CurrentPage` (nullable int) and `MyRating` (nullable `ReaderMyRatingDto`: `Stars`, `Review`) for the authenticated user. Each `ReaderPageDto` exposes `Id` (page identity), `Number` (persisted page order), and `Url` (protected image URL via `/images/{imageId}`). Physical storage paths, blob internals, and credentials are never exposed. `MyRating` lets the Reader final form (position `TotalPages + 1`) show the user's existing vote; it is `null` when the user has not voted or the request is anonymous.
- **Boundaries**: the Service does not build LINQ queries, does not generate URLs from the Repository, does not implement authorization, progress, or history. Availability is enforced at the Service layer using the existing `IsActive` rule.

### UpdateReadingProgressAsync

- **Signature**: `UpdateReadingProgressAsync(long workId, long userId, int currentPage, CancellationToken)` ? `Task`.
- **Responsibilities**: validates `workId > 0`, `userId > 0`, `currentPage >= 1`, verifies Work exists and is active, verifies User exists. Obtains `TotalPages` from `Work.Pages.Count`. Implements idempotent upsert: queries existing `WorkReadingProgress` via `IWorkReadingProgressRepository.GetByWorkIdAndUserIdAsync`; if exists, updates all fields; if not, creates new entity with `Work` and `User` navigations set, initializes `CurrentPage = 0`, `TotalPages = Work.Pages.Count`, `PercentageReading = 0`, `LastReadAt = UtcNow`, `State = Reading`. On both create and update: recalculates `PercentageReading = TotalPages == 0 ? 0 : (CurrentPage - 1) * 100 / TotalPages`, updates `LastReadAt = UtcNow`, recalculates `State` (`CurrentPage >= TotalPages + 1` ? `Completed` : `Reading`). Normalizes `currentPage` to `TotalPages + 1` if it exceeds the valid maximum. Persists via `IUnitOfWork.SaveChangesAsync`.
- **Boundaries**: all progress fields calculated server-side; `TotalPages`, `PercentageReading`, `LastReadAt`, `State` never received from client. State can transition back from `Completed` to `Reading` if user navigates to earlier page.

### GetCurrentPageAsync

- **Signature**: `GetCurrentPageAsync(long workId, long userId, CancellationToken)` ? `int?`.
- **Responsibilities**: validates `workId > 0`, `userId > 0`, queries `IWorkReadingProgressRepository.GetByWorkIdAndUserIdAsync`, returns `CurrentPage` or `null` if no progress exists.
- **Boundaries**: read-only operation; does not create progress record.

## WorkRatingService

- **Location**: `Application/Services/WorkRatingService.cs`
- **Interface**: `IWorkRatingService`
- **Dependencies**: `IUnitOfWork`, `ILogger<WorkRatingService>`
- **Operations**: `CreateOrUpdateAsync`, `GetPagedByWorkIdAsync`
- **Notes**: Single service for the votes and reviews of a Work (US-0030). The user identity always comes from the authenticated context (`userId` received from the controller, extracted from the JWT); a client-supplied `UserId` is never trusted. The Work must exist and be active; the user must exist. Scores are normalized in the Domain as a non-nullable `int` from 0 to 5, where `0` is a valid vote with no star selected (the public request contract accepts `int?` and `null` is normalized to `0`; values outside 0..5 are rejected with `ValidationException`). The optional review is trimmed; an empty review is stored as `null`. Every `WorkRating` row is a vote: a user can vote with or without a review.

### CreateOrUpdateAsync

- **Signature**: `CreateOrUpdateAsync(long workId, long userId, int? stars, string? review, CancellationToken)` ? `WorkRatingDto`.
- **Responsibilities**: idempotent upsert of the user's rating for the Work. When no rating exists for user + Work it creates one (`CreatedAt` = UtcNow, `UpdatedAt` = null) and increments `Work.RatingCount`; when a rating already exists it edits that same record (preserves `CreatedAt`, sets `UpdatedAt` = UtcNow) and never changes `Work.RatingCount`. The persisted pair (User, Work) is unique at database level, so a second save edits the first vote instead of creating a duplicate. Persisted with `IUnitOfWork.SaveChangesAsync`; the rating record and the Work accumulators are updated in the same unit of work.
- **Accumulator rules**: on create, `newCount = RatingCount + 1` and `newAverage = (RatingCount * AverageRating + score) / newCount`, zero-star votes included. On edit, the average is recomputed only when the score changes, using `newAverage = (RatingCount * AverageRating - previousStars + score) / RatingCount`; comment-only edits leave the accumulators untouched.
- **Atomicity and concurrency**: the rating row and the accumulator update run inside a single DB transaction (`IUnitOfWork.BeginTransAsync` / `CommitAsync`, with `RollbackAsync` on failure). The accumulators are updated **in the database** (`UPDATE Works SET AverageRating = ..., RatingCount = ...`) so concurrent votes never lose updates: the formulas read the stored values inside the statement, not an in-memory copy. The accumulator update is always the first write of the transaction, so every vote takes the Work row lock before touching `WorkRatings`; this avoids the deadlock produced by taking the FK shared lock of the insert first. If a concurrent request already inserted the same user's vote (unique index `(WorkId, UserId)`), the rejected request rolls back, re-reads the existing vote and completes as an edit.
- **Row reuse**: the pair (User, Work) is unique at database level, so the edit path always reuses the existing row. If that row was deactivated, the edit reactivates it (`IsActive = true`); a second vote can never create a duplicate row.
- **`IsActive` semantics for `WorkRating`**: US-0030 has no delete or moderation flow, so no production path deactivates a rating; the flag exists per the entity conventions and keeps deactivated ratings out of the listing. Reactivating on edit does not change the accumulators by itself (the count is unchanged and the previous score of that row is still part of the accumulated total). Any future flow that deactivates a rating without reactivating it must subtract that vote from the accumulators, otherwise `RatingCount` would count an invisible vote.
- **Rounding**: the average is stored with full `double` precision (no rounding); presentation rounding belongs to the Frontend.
- **Boundaries**: the service does not build LINQ queries (the repository does), does not authorize (the controller does) and never touches `WorkReadingProgress`; a rating never modifies reading progress.

### GetPagedByWorkIdAsync

- **Signature**: `GetPagedByWorkIdAsync(long workId, GetWorkRatingsRequest request, CancellationToken)` ? `ListResponse<WorkRatingListItemDto>`.
- **Responsibilities**: validates `workId > 0`, normalizes pagination with `PaginationGuard` (default 12, max 50), defaults the ordering to `CreatedAt DESC`, delegates the query to `IWorkRatingRepository.GetPagedByWorkIdAsync`, maps entities to `WorkRatingListItemDto` and builds the response with `PaginationGuard.Build`. Raises `BusinessNotFoundException` when the Work does not exist or is inactive, so ratings of unavailable works are never exposed.
- **Mapping**: `WorkRatingListItemDto` exposes Id, UserId, UserName (first name + last name), UrlAvatar, Stars, Review and CreatedAt of each rating. Zero-star votes are ordinary rows and are included. The visual presentation belongs to the Frontend and is not part of the service.
- **Ordering**: `Stars` or `CreatedAt`, ascending or descending, with `Id` as deterministic tie-breaker; unknown or missing `orderBy` falls back to `CreatedAt`.

## WorkContentService

- **Location**: `Application/Services/WorkContentService.cs`
- **Controller**: `AdminWorksController`
- **Dependencies**: `IWorkRepository`, `IPageRepository`, `IImageRepository`, `IFileStorageService`, `IBackgroundJobService`, `IUnitOfWork`
- **Operations**: Upload CBR content, get content status, retry failed processing, delete content, get images list, set cover from content
- **Notes**: Unified content service for all works (replaces former NumberContentService and GraphicNovelContentService). Enqueues CBR processing background jobs. Validates work existence and processing state. Deletes pages and images when content is deleted. Cover can only be set to images belonging to the work's content.

## WorkAnalyzer

- **Location**: `Application/Services/WorkAnalyzer.cs`
- **Dependencies**: `IUnitOfWork`, `IFileStorageService`, `IAIService`, `ILogger<WorkAnalyzer>`
- **Operations**: Core AI analysis logic shared by HTTP and background processing:
  - Recover Work by ID, validate completion status
  - Validate ImageIds belong to Work's content
  - Read physical image files via `IFileStorageService`
  - Build `AIImagePart` list, invoke `IAIService` with prompt from `ComicAnalysisParser.BuildPrompt`
  - Parse response with `ComicAnalysisParser.TryParse`
- **Returns**: `ComicAnalysisResult?` (null = work not found, not completed, invalid images, or unparsable AI response)
- **Notes**: Pure business logic, no HTTP concerns, no Hangfire concerns. Single source of truth for AI analysis algorithm. Used by both `WorkAnalysisService` and `WorkAnalysisJob`.

## WorkAnalysisService

- **Location**: `Application/Services/WorkAnalysisService.cs`
- **Controller**: `AdminWorksController`
- **Dependencies**: `WorkAnalyzer`
- **Operations**: AI-powered comic analysis (title, publisher, number, description, summary, publication date, writers, artists, inkers, tags, characters)
- **Notes**: Thin wrapper over `WorkAnalyzer`. Handles HTTP-layer validation (workId > 0, imageIds not empty) and throws domain exceptions (`ValidationException`, `BusinessNotFoundException`) for API consumers. Does not contain analysis logic.

## BackgroundJobService

- **Location**: `Infrastructure/Services/BackgroundJobService.cs`
- **Interface**: `IBackgroundJobService`
- **Dependencies**: `IBackgroundJobClient` (Hangfire)
- **Operations**: 
  - `EnqueueCbrProcessing(long workId, string cbrFilePath)` — enqueues CBR processing job (queue: `cbr-processing`)
  - `EnqueueWorkAnalysis(long workId, IReadOnlyList<long> imageIds)` — enqueues AI analysis job (queue: `ai-analysis`)
- **Notes**: Uses Hangfire for background job enqueuing. Jobs are executed asynchronously by Hangfire workers. Arguments are serializable identifiers only (no entities or byte arrays).

## WorkAnalysisJob (Hangfire Worker)

- **Location**: `Infrastructure/Jobs/WorkAnalysisJob.cs`
- **Queue**: `ai-analysis` (separate from `cbr-processing`)
- **Dependencies**: `WorkAnalyzer`, `IUnitOfWork`, `IWorkRepository`
- **Arguments**: `WorkId` + `ImageIds[]` (serializable, no entities or byte arrays)
- **Concurrency**: **NOT IMPLEMENTED** (known issue). Currently no lock prevents duplicate analysis of same WorkId. Mitigation: retry eventual + idempotent overwrite of `IAResponse`. Future: distributed lock per WorkId.
- **Processing flow**:
  1. Call `WorkAnalyzer.AnalyzeAsync(workId, imageIds)`
  2. **Valid result** ? serialize to JSON ? persist in `Work.IAResponse`; `IARequest` remains `true`
  3. **Null result** (work not found, not completed, invalid images, unparsable AI) ? schedule retry with random 1–10 min delay via `BackgroundJob.Schedule`
  4. **Exception** (AI provider error, unexpected) ? schedule retry with random 1–10 min delay
- **Retry**: Explicit `BackgroundJob.Schedule` with random delay (1–10 min), **not** Hangfire `AutomaticRetry`. Each attempt re-fetches Work, images, and files from scratch via `WorkAnalyzer`. No max retry limit.
- **State management**: `IARequest` stays `true` throughout. `IAResponse` = `null` during processing/error; set to JSON on success. Definitive Work fields are never auto-modified.
## ReadingHistoryService

- **Location**: `Application/Services/ReadingHistoryService.cs`
- **Interface**: `IReadingHistoryService`
- **Dependencies**: `IUnitOfWork`, `ILogger<ReadingHistoryService>`
- **Operations**: `GetPagedAsync`
- **Notes**: Serves US-0031 (Mi colección): the reading history of the authenticated user, built from `WorkReadingProgress`. The user identity always comes from the authenticated context (`userId` received from the controller, extracted from the JWT); a client-supplied `UserId` is never trusted and is not part of the request contract. Read-only: it never creates or modifies progress.

### GetPagedAsync

- **Signature**: `GetPagedAsync(GetReadingHistoryRequest request, long userId, CancellationToken)` ? `ListResponse<WorkCatalogItemDto>`.
- **Responsibilities**: validates `userId > 0`, normalizes pagination with `PaginationGuard` (default 12, maximum 50), translates the `state` filter, delegates the paginated and ordered query to `IWorkReadingProgressRepository.GetPagedHistoryByUserIdAsync`, maps every progress to a catalog `WorkCard` with `WorkCardMapper.ToCard` and builds the response with `PaginationGuard.Build`.
- **State filter**: `reading` ? `ReadingState.Reading`, `completed` ? `ReadingState.Completed`, `all` / absent / empty / unknown value ? no filter (the complete history of the user). Unknown values are intentionally treated as `all`: the frontend does not need to validate the value, and the fallback only ever returns the user's own history, never the full catalog. Documented in `endpoints/endpoints-reading-history.md`.
- **Visibility**: only works that are currently active are returned, matching the catalog rules, so works deactivated after being read never appear in the history.
- **Contract**: each item is the same `WorkCatalogItemDto` used by `GET /api/works`, including `myReadingProgress` (never `null` here, since every item has progress by definition). `percentage` is the persisted `PercentageReading`; no value is recalculated. verageRating is the average of the active ratings of the Work (zero-star votes included) or 
ull when it has none, mapped from the Work accumulators.
## RecommendedWorksService

- **Location**: `Application/Services/RecommendedWorksService.cs`
- **Interface**: `IRecommendedWorksService`
- **Dependencies**: `IUnitOfWork`, `ILogger<RecommendedWorksService>`
- **Operations**: `GetRecommendedAsync`
- **Notes**: Serves US-0033 (Recomendados del catálogo): up to 12 works the authenticated user has not started reading, for the index section. The user identity comes from the authenticated context (`userId` received from the controller, extracted from the JWT); a client-supplied `UserId` is never trusted and is not part of the request contract. Read-only: it never creates or modifies works, progress or ratings.

### GetRecommendedAsync

- **Signature**: `GetRecommendedAsync(long? userId, string? sortBy, CancellationToken)` ? `IReadOnlyList<WorkCatalogItemDto>`.
- **Responsibilities**: normalizes and validates the criterion, delegates the query to `IWorkRepository.GetRecommendedAsync` and maps every work to the catalog `WorkCard` with `WorkCardMapper.ToCard` (progress is always `null`, since a recommended work has no progress for the user).
- **Criterion**: `MostPopular` (default, also for empty or whitespace), `RecentlyAdded` and `MostRated`, all case-insensitive. Any other value raises `ValidationException` (422).
- **Eligibility**: only active works without reading progress of the given user; anonymous-style calls (`userId` null) exclude nothing.
- **Ordering**: resolved by the repository in the database (`MostPopular` orders by the weighted reading progress `SUM(PercentageReading)`; `MostRated` by the average of active ratings with unrated works last; `RecentlyAdded` by `CreatedAt`), always with `CreatedAt` and `Id` as tie-breakers. The service never recalculates metrics in memory.
- **Contract**: the same `WorkCatalogItemDto` as `GET /api/works`, so the Public Web reuses the existing `WorkCard` and mapping. verageRating is the average of the active ratings of the Work (zero-star votes included) or 
ull when it has none, mapped from the Work accumulators without any extra query. Documented in `endpoints/endpoints-recommended-works.md`.