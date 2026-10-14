# Backend Coding Rules � EF Core

## Service boundaries

- One service = one bounded responsibility. If a service has more than 7 dependencies, it is doing too much. Split it.
- A service that mixes CRUD with cross-aggregate orchestration (e.g. `SyncPersonByRoles`, `SyncTags`, `UpdateContinuity`) must delegate the orchestration to a `XxxRelationsService` (internal to the aggregate). The CRUD service depends on the relations service. The pattern is `NumberService` → `INumberRelationsService` (see `NumberService.cs`, `NumberRelationsService.cs`).
- The `Number` aggregate is the reference: CRUD in `NumberService`, content (CBR/CBZ) in `NumberContentService`, AI in `NumberAnalysisService`, internal sync in `NumberRelationsService`. The same pattern applies to any aggregate that grows past 200 lines or 7 dependencies.

## Repository pattern

- Explicit repositories oriented to concrete domain concepts. No `IRepository<T>`, `GenericRepository<T>`.
- Interfaces in Application or upper layer. Implementations in Infrastructure.
- Every read-only query must end with `.AsNoTracking()` (tracking is only needed when the caller will mutate the entity).
- Every query that has 3 or more `Include`/`ThenInclude` calls must use `.AsSplitQuery()` to avoid Cartesian explosion. The rule of thumb: if the includes form a fan-out (parent has multiple of child A, child B, child C), split.
- Every FK column must have a corresponding index in the EF configuration. If the FK is a shadow property, use the `HasIndex("ColumnName")` string overload.

## Helpers (DRY)

The following helpers exist and must be used. Do not reimplement them inline.

- `Application/Helpers/Guard.cs`:
  - `Guard.Require<T>(entity, message)` — throws `BusinessNotFoundException` if null.
  - `Guard.RequireActive<T>(entity, entityName)` — throws `BusinessNotFoundException` if null or `IsActive == false`. Uses reflection to read `IsActive` so it works on any entity with that property.
  - `Guard.RequireGreaterThan(value, paramName)` — throws `ValidationException` if value <= 0.
  - `Guard.RequireNotEmpty(byte[]? data, paramName)` — throws `ValidationException` if data is null or empty.
  - `Guard.RequireNotEmpty(string? value, fieldName)` — throws `ValidationException` if value is null or whitespace.
- `Application/Helpers/ColorValidator.cs`:
  - `ColorValidator.IsValidHex(string?)` — returns `true` for `#RRGGBB` (case-insensitive), `false` otherwise.
- `Application/Helpers/ImageUrlBuilder.cs`:
  - `ImageUrlBuilder.ToUrl(Image?)` — returns `null` if image is null, else `$"/images/{image.Id}"`.
- `Application/Helpers/PaginationGuard.cs` (existing):
  - `PaginationGuard.Normalize(...)` and `PaginationGuard.Build<T>(...)` — use these in every service that paginates.
- `Infrastructure/Persistence/QueryablePagingExtensions.cs`:
  - `query.ApplyPaging(currentPage, pageSize)` — returns the paged slice.
  - `query.ToPagedResultAsync(currentPage, pageSize, ct)` — returns `(items, totalCount)` in one call.
- `Api/Helpers/FormFileReader.cs`:
  - `FormFileReader.ReadAsync(IFormFile?, CancellationToken)` — copies the form file to a `byte[]`.
- `Api/Helpers/CookieOptionsFactory.cs`:
  - `CookieOptionsFactory.Create(IRefreshTokenCookieSettingsProvider)` — for setting a refresh token cookie.
  - `CookieOptionsFactory.CreateDelete(IRefreshTokenCookieSettingsProvider)` — for clearing it.
- `Api/Middleware/SensitiveDataRedactionEnricher.cs`:
  - Registered globally on Serilog. You do not need to do anything; never log a value whose property name is in the sensitive list (Password, Code, Token, Authorization, ApiKey, etc.).

When you write a new helper, it goes in the right layer (BCL only → Application, EF → Infrastructure, ASP.NET → Api) and has unit tests.

## Unit of Work

- Coordinates transaction commits. Interface in Application, implementation in Infrastructure.
- `BeginTrans()` -> repositories execute operations -> `Commit()`.
- Never call `Rollback` manually. `Dispose` handles rollback automatically when transaction is not committed.
- Registered as Scoped. Same request shares same DbContext.
- For single operations without transaction need, call `SaveChangesAsync()` directly.

## Relationships

- Entities expose only navigation properties. No FK scalar properties (e.g., `CountryId`).
- EF Core manages FK as shadow property in configuration (`HasForeignKey("CountryId")`).
- **Never use scalar FK properties directly.** When you need to associate entities, assign the navigation property (`page.Image = image`, `page.Number = number`). Never set `page.ImageId = image.Id`. EF Core resolves the FK from the navigation at save time.
- **Never assign scalar FK values manually.** Setting `page.ImageId` or `page.NumberId` by hand is forbidden; use the navigation property instead. This prevents FK constraint violations when the referenced entity has not been persisted yet (the `Id` is 0 at in-memory time).
- To associate an entity, fetch the related entity from its repository and assign it to the navigation property.
- To disassociate, set the navigation property to null. Do not set FK to 0 or null.

## Lazy loading

- Lazy loading is enabled by default via `UseLazyLoadingProxies()` on `ApplicationDbContext`.
- Do **not** create "GetXWithY" methods (`GetNumberWithPagesAsync`, `GetPageWithImageAsync`, etc.). When you need a related collection, access the navigation property directly (`number.Pages`, `page.Image`); the proxy loads it from the database on first access, provided the entity is tracked.
- For entities obtained from repositories that use `AsNoTracking()` or for queries that project to DTOs, lazy loading is **not** available because the proxy is not active. In those cases, use explicit `.Include()` if you need the related data, or accept that the entity is read-only.
- `AsNoTracking()` must be used only on queries that are strictly read-only **and** never accessed for lazy navigation in the same scope.

## AsNoTracking policy

- **Do not add `AsNoTracking()` to `GetByIdAsync`, `GetByXxxAsync`, or any single-entity lookup** that may be used as a mutable entity. `AsNoTracking` disables lazy loading and prevents the entity from being used in updates, which causes runtime `InvalidOperationException` ("entity cannot be tracked") errors.
- `AsNoTracking()` is permitted only on genuinely read-only queries: paged lists, detail views, search results — queries that never touch the DbContext for mutations afterward.
- When in doubt, omit `AsNoTracking()`. The default (tracking) is always safe; over-tracking is a performance concern, but under-tracking (missing the entity you need to mutate) is a correctness bug.

## Dependency Injection
