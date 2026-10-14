# Services — Index

Application and infrastructure services. The per-service details live in the per-module files under `services/`.

## File index

| File | Contents |
| --- | --- |
| `services/services-users.md` | UserService, UserQueryService, AdminUserService, AuthService, PasswordResetService, AccountDeletionService, BanService |
| `services/services-catalog.md` | CountryService, PublisherService, FranchiseService, SeriesService, PersonService, RoleService, ListTypeService, WorkTypeService, WorkService, WorkContentService, WorkAnalysisService, WorkListService, WorkRatingService, ReadingHistoryService, RecommendedWorksService |

## Infrastructure services

| Service | Responsibility | Location |
|---------|---------------|----------|
| EmailService | SMTP email dispatch with templates | `Infrastructure/Services/EmailService.cs` |
| GoogleAuthenticationService | Validates Google ID tokens, extracts user info | `Infrastructure/Services/GoogleAuthenticationService.cs` |
| GoogleClientSettingsProvider | Provides Google Client ID from config | `Infrastructure/Settings/GoogleClientSettingsProvider.cs` |
| PasswordHasher | Password hashing/verification via ASP.NET Core Identity | `Infrastructure/Services/PasswordHasher.cs` |
| JwtTokenGenerator | Generates signed JWT access tokens | `Infrastructure/Services/JwtTokenGenerator.cs` |
| RefreshTokenGenerator | Generates cryptographically secure refresh token values | `Infrastructure/Services/RefreshTokenGenerator.cs` |
| RefreshTokenHasher | Hashes refresh tokens for storage (SHA256) | `Infrastructure/Services/RefreshTokenHasher.cs` |
| RefreshTokenCookieSettingsProvider | Provides cookie config for refresh tokens | `Infrastructure/Settings/RefreshTokenCookieSettingsProvider.cs` |
| PasswordResetCodeService | Generates/validates 6-digit password recovery codes | `Infrastructure/Services/PasswordResetCodeService.cs` |
| PasswordResetAuthorizationService | Generates/hashes/validates temporary auth tokens for password reset | `Infrastructure/Services/PasswordResetAuthorizationService.cs` |
| AccountDeletionCodeService | Generates/validates 6-digit account deletion codes | `Infrastructure/Services/AccountDeletionCodeService.cs` |
| FileStorageService | Persists/deletes uploaded images, resolves physical paths | `Infrastructure/Services/FileStorageService.cs` |
| PasswordValidator | Validates password strength (min 8 chars, digit, lowercase, uppercase, special) | `Infrastructure/Services/PasswordValidator.cs` |
| InitialAdminSeeder | Ensures initial admin user exists after migration | `Infrastructure/Seed/InitialAdminSeeder.cs` |

## Application helpers (DRY)

| Helper | Responsibility | Location |
|--------|---------------|----------|
| `Guard` | Validation guards: `Require<T>`, `RequireActive<T>`, `RequireGreaterThan`, `RequireNotEmpty` (overloads for `byte[]` and `string`). Replaces 18+ inline `if (x is null \|\| !x.IsActive) throw ...` patterns. | `Application/Helpers/Guard.cs` |
| `ColorValidator` | `IsValidHex(string?)` — validates `#RRGGBB` format using `[GeneratedRegex]`. Replaces 3 duplicated `ValidateHexColor` methods. | `Application/Helpers/ColorValidator.cs` |
| `ImageUrlBuilder` | `ToUrl(Image?)` — returns `null` or `$"/images/{image.Id}"`. Replaces 6+ inline URL constructions. | `Application/Helpers/ImageUrlBuilder.cs` |
| `WorkCardMapper` | `ToCard(Work, WorkReadingProgress?)` → `WorkCatalogItemDto` and `ToProgress(WorkReadingProgress?)` → `ReaderMyProgressDto`. Single manual mapping of the catalog `WorkCard`, shared by the catalog, the work detail and the reading history so the three endpoints return identical card data. `ToCard` maps `AverageRating` from the `Work` accumulators: the real average when the Work has ratings (`RatingCount > 0`, zero-star votes included) and `null` when it has none, so the listing adds no query. | `Application/Helpers/WorkCardMapper.cs` |
| `PaginationGuard` | `Normalize(...)` and `Build<T>(...)` for list responses, plus the paging constants `DefaultPageSize`, `MaxPageSize`, `CatalogFilterMaxPageSize`, `CatalogCardDefaultPageSize` and `CatalogCardMaxPageSize`. Existing, used by all paginated services. | `Application/DTOs/PaginationGuard.cs` |
| `QueryablePagingExtensions` | `ApplyPaging<T>(IQueryable<T>, int, int)` and `ToPagedResultAsync<T>(IQueryable<T>, int, int, CancellationToken)`. Replaces 10 inline `Skip/Take` chains. | `Infrastructure/Persistence/QueryablePagingExtensions.cs` |
| `ComicAnalysisParser` | `Parse(string)`, `BuildPrompt(string)`, `Empty()`. AI multimodal response parser. | `Application/Services/ComicAnalysisParser.cs` |
| `TagsResponseParser` | `Parse(string)` — splits AI tag suggestions on `,`/`\n`/`;`, trims quotes, max 5 tags. | `Application/Services/TagsResponseParser.cs` |
| `CbrFileValidator` | `IsPathWithinTempRoot(string, string)` and `IsImageFile(string)`. Static, internal. Used by `CbrProcessingJob` and tests. | `Infrastructure/Jobs/CbrFileValidator.cs` |

## Api helpers (DRY)

| Helper | Responsibility | Location |
|--------|---------------|----------|
| `FormFileReader` | `ReadAsync(IFormFile?, CancellationToken)` — copies a form file to `byte[]`. Replaces 6+ inline `MemoryStream.CopyToAsync` blocks. | `Api/Helpers/FormFileReader.cs` |
| `CookieOptionsFactory` | `Create(settings)` and `CreateDelete(settings)` for refresh token cookies. Replaces 5 inline `new CookieOptions { ... }` blocks. | `Api/Helpers/CookieOptionsFactory.cs` |
| `GlobalExceptionHandlerMiddleware` | Maps domain exceptions to HTTP status codes. `ValidationException` and `BusinessException` → 422, `InvalidCredentialsException` → 401, `BusinessNotFoundException` → 404, `BusinessConflictException` → 409, `RateLimitExceededException` → 429, `Exception` → 500. | `Api/Middleware/GlobalExceptionHandlerMiddleware.cs` |
| `RateLimiterConfiguration` | `AddComicLibraryRateLimiter()` extension. Registers 8 `FixedWindowLimiter` policies. Apply via `[EnableRateLimiting(RateLimitPolicies.X)]` on the action. | `Api/Middleware/RateLimiterConfiguration.cs` |
| `SensitiveDataRedactionEnricher` | `Serilog.Core.ILogEventEnricher` that redacts properties named `Password`, `Code`, `Token`, `Authorization`, `ApiKey`, etc. (case-insensitive) with `***REDACTED***`. Registered globally on Serilog. | `Api/Middleware/SensitiveDataRedactionEnricher.cs` |

## Configuration

| Class / Validator | Purpose | Location |
|-------------------|---------|----------|
| `JwtOptions` | Strongly-typed JWT configuration: `Issuer`, `Audience`, `SecretKey`, `ExpirationMinutes`. | `Application/Configuration/JwtOptions.cs` |
| `JwtOptionsValidator` | `IValidateOptions<JwtOptions>` — rejects empty / too-short / placeholder secret keys, out-of-range expiration. Runs at startup via `.ValidateOnStart()`. | `Application/Configuration/JwtOptionsValidator.cs` |
| `RateLimitPolicies` | Constants for the 8 rate limit policy names. Used in `[EnableRateLimiting]` attributes. | `Application/Constants/RateLimitPolicies.cs` |
| `Roles` | Role name constants (currently only `Administrator`). | `Application/Constants/Roles.cs` |
| `SortDirection` | `ASC` / `DESC` for pagination. | `Application/Constants/SortDirection.cs` |