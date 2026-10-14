# Application Services

Orchestrates use cases. Coordinates repositories, infrastructure services, UnitOfWork, DTO mapping.

## UserService

- **Location**: `Application/Services/UserService.cs`
- **Controller**: `UsersController`
- **Dependencies**: `IUserRepository`, `ICountryRepository`, `IPasswordHasher`, `IEmailService`, `IFileStorageService`, `IJwtTokenGenerator`, `IEmailTokenSettingsProvider`, `IUnitOfWork`, `IImageRepository`
- **Operations**: Registration, email validation, resend validation, profile retrieval, profile update (including avatar management)
- **Notes**: Validates email uniqueness for active validated users. Handles unvalidated user replacement when code expired. Validates country exists and is active when provided. Hashes password. Processes/stores avatar as WebP. Generates 6-digit validation code. No independent avatar endpoints; avatar integrated into profile flow.

## UserQueryService

- **Location**: `Application/Services/UserQueryService.cs`
- **Controller**: `UsersController`, `BansController`
- **Dependencies**: `IUserRepository`
- **Operations**: Paginated user lists for admin, active users without bans for ban selection
- **Notes**: Validates/normalizes pagination and ordering. Maps entities to DTOs with ban status and count.

## AdminUserService

- **Location**: `Application/Services/AdminUserService.cs`
- **Controller**: `AdminUsersController`
- **Dependencies**: `IUserRepository`, `ICountryRepository`, `IPasswordHasher`, `IPasswordValidator`, `IUnitOfWork`, `IImageRepository`, `IFileStorageService`
- **Operations**: Paginated admin list, detail by ID, create admin, update admin, deactivate, activate
- **Notes**: Creates with validated email and hashed password. Validates at least one active admin remains on deactivation. Validates email uniqueness and country existence/active. Validates password strength for new admins. Role cannot be modified through admin endpoints. Detail returns 404 if user does not exist or is not an administrator. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete.

## CountryService

- **Location**: `Application/Services/CountryService.cs`
- **Controller**: `AdminCountriesController`, `CountriesController`
- **Dependencies**: `ICountryRepository`, `IUnitOfWork`
- **Operations**: Active countries for public, paginated admin lists, create, update, deactivate, activate
- **Notes**: Validates Code and Name uniqueness. No physical deletion. `GetPagedAsync` accepts nullable `isActive`; service layer decides filter.

## PublisherService

- **Location**: `Application/Services/PublisherService.cs`
- **Controller**: `AdminPublishersController`
- **Dependencies**: `IPublisherRepository`, `ICountryRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, detail, create, update, deactivate, activate
- **Notes**: Validates name uniqueness, country existence/active (when provided), hex color format `#RRGGBB`. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete. Country optional. Ordering by Name and Country.Name only.

## FranchiseService

- **Location**: `Application/Services/FranchiseService.cs`
- **Controller**: `AdminFranchisesController`
- **Dependencies**: `IFranchiseRepository`, `IPublisherRepository`, `ICountryRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, detail, create, update, deactivate, activate
- **Notes**: Validates name required, publisher existence/active, hex color format `#RRGGBB`. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete. IsActive cannot be modified through create/update (only via activate/deactivate). Ordering by Name, PublisherCountry, PublisherName only.

## SeriesService

- **Location**: `Application/Services/SeriesService.cs`
- **Controller**: `AdminSeriesController`
- **Dependencies**: `ISeriesRepository`, `IFranchiseRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, detail, create, update, deactivate, activate
- **Notes**: Validates name required, franchise existence/active, hex color format `#RRGGBB`. Avatar management integrated into create/update (no independent image endpoints). `imageId = existingId + avatar = null` -> keep; `imageId = 0 + avatar = file` -> replace; `imageId = 0 + avatar = null` -> delete. IsActive cannot be modified through create/update (only via activate/deactivate). No uniqueness constraint on Name. Ordering by Name, Franchise, Publisher, Country only.

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
- **Operations**: Paginated list (search by name), create
- **Notes**: Validates name required, name uniqueness. Returns RoleListItemDto with Id, Name.

## NumberService

- **Location**: `Application/Services/NumberService.cs`
- **Controller**: `AdminNumbersController`
- **Dependencies**: `INumberRepository`, `ISeriesRepository`, `ILanguageRepository`, `IPersonRepository`, `IRoleRepository`, `ITagRepository`, `IImageRepository`, `IFileStorageService`, `IUnitOfWork`
- **Operations**: Paginated list, detail, create, update, deactivate, activate
- **Notes**: Validates number required, title required, language existence, publication date required. Number + SeriesId must be unique. Syncs PersonByRoles and TagByNumbers. Manages bidirectional continuity relationships. Validates previous/number belong to same series. Cover management integrated into create/update (no independent image endpoints). ContentStatus independent of IsActive.

## AuthService

- **Location**: `Application/Services/AuthService.cs`
- **Controller**: `UsersController`
- **Dependencies**: `IUserRepository`, `IPasswordHasher`, `IJwtTokenGenerator`, `IRefreshTokenRepository`, `IRefreshTokenGenerator`, `IRefreshTokenHasher`, `IUnitOfWork`, `IRefreshTokenSettingsProvider`, `IGoogleAuthenticationService`, `IBanRepository`
- **Operations**: Login, Google login, refresh token rotation, logout
- **Notes**: Same error message for non-existent user and incorrect password. Blocks auth for unvalidated emails or inactive users. Refresh token rotation orchestrated from Application. Raw refresh token returned only for Presentation to set HttpOnly cookie; never in JSON response. JWT includes `role` claim with persisted `UserRole`. Logout is idempotent. Google auth reuses same session mechanism. New Google users have email validated, no password, `IsActive = true`. Does not reactivate inactive users. JWT configured with `MapInboundClaims = false`.

## PasswordResetService

- **Location**: `Application/Services/PasswordResetService.cs`
- **Controller**: `UsersController`
- **Dependencies**: `IUserRepository`, `IPasswordResetTokenRepository`, `IPasswordResetCodeService`, `IEmailService`, `IUnitOfWork`, `IPasswordResetAuthorizationService`, `IPasswordResetAuthorizationRepository`, `IPasswordHasher`, `IPasswordValidator`, `IRefreshTokenRepository`
- **Operations**: Forgot password, resend code, validate code, reset password
- **Notes**: Validates user exists, is active, has validated email. Invalidates previous codes before generating new. Generic error message to avoid enumeration. Password change invalidates all sessions. New password hashed before persistence. Temporary authorization tokens single-use and time-limited.

## AccountDeletionService

- **Location**: `Application/Services/AccountDeletionService.cs`
- **Controller**: `UsersController`
- **Dependencies**: `IUserRepository`, `IAccountDeletionTokenRepository`, `IAccountDeletionCodeService`, `IEmailService`, `IUnitOfWork`, `IRefreshTokenRepository`, `IAccountDeletionTokenSettingsProvider`
- **Operations**: Request deletion code, confirm deletion
- **Notes**: Validates authenticated user exists and is active. Generates 6-digit code. Invalidates previous codes. Sets `IsActive = false` on confirmation. Revokes all active refresh tokens. Does not reveal whether account exists. Raw code never returned to client.

## BanService

- **Location**: `Application/Services/BanService.cs`
- **Controller**: `BansController`
- **Dependencies**: `IBanRepository`, `IUserRepository`, `IUnitOfWork`
- **Operations**: Paginated ban list, create ban, update ban, deactivate
- **Notes**: Validates user existence, active status, absence of conflicting active bans. Validates start date not after end date. Dates remain in UTC. Logical deactivation (`IsActive = false`). No physical deletion.
