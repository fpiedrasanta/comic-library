# Repositories — Users

EF Core repositories for user management, authentication tokens, bans, and images.

## Conventions

- Every read-only query ends with `.AsNoTracking()`.
- Every query with 3 or more `Include`/`ThenInclude` calls uses `.AsSplitQuery()` to avoid Cartesian explosion.
- Every FK column has a corresponding `HasIndex` in the EF configuration. Shadow FKs use the `HasIndex("ColumnName")` string overload.
- No `IQueryable<T>` is exposed in interfaces. Repositories return `Task<T>`, `Task<(IReadOnlyList<T>, int)>`, or already-materialized DTOs.
- No `DbSet.Remove` / `DbSet.RemoveRange`. Deactivation uses `IsActive = false`.

## UserRepository

- **Interface**: `IUserRepository`
- **Location**: `Infrastructure/Repositories/UserRepository.cs`
- **Operations**: `GetByEmailAsync`, `GetByEmailAndValidationTokenHashAsync`, `AddAsync`, `GetByIdAsync`, `UpdateAsync`, `DeactivateAsync`, `GetPagedAsync`, `GetActiveForBanSelectionAsync`, `GetAdminUsersPagedAsync`, `GetActiveAdminUsersCountAsync`
- **Notes**: EF Core. Email uniqueness at DB level. No physical deletion; uses `IsActive`. Read-only queries use `AsNoTracking`.

## RefreshTokenRepository

- **Interface**: `IRefreshTokenRepository`
- **Location**: `Infrastructure/Repositories/RefreshTokenRepository.cs`
- **Operations**: `AddAsync`, `GetByTokenHashAsync`, `GetActiveByUserIdAsync`, `UpdateAsync`
- **Notes**: EF Core. Tokens stored as hashes, not plain text. **Indexes**: `UserId` (added 2026-09), `(IsUsed, ExpiresAt)` (added 2026-09, supports the "find active token by user" lookup).

## PasswordResetTokenRepository

- **Interface**: `IPasswordResetTokenRepository`
- **Location**: `Infrastructure/Repositories/PasswordResetTokenRepository.cs`
- **Operations**: `AddAsync`, `GetByTokenHashAsync`, `GetActiveByUserIdAsync`, `UpdateAsync`
- **Notes**: EF Core. Reset codes stored as hashes.

## PasswordResetAuthorizationRepository

- **Interface**: `IPasswordResetAuthorizationRepository`
- **Location**: `Infrastructure/Repositories/PasswordResetAuthorizationRepository.cs`
- **Operations**: `AddAsync`, `GetByTokenHashAsync`, `UpdateAsync`
- **Notes**: EF Core. Authorization tokens stored as hashes.

## AccountDeletionTokenRepository

- **Interface**: `IAccountDeletionTokenRepository`
- **Location**: `Infrastructure/Repositories/AccountDeletionTokenRepository.cs`
- **Operations**: `AddAsync`, `GetByTokenHashAsync`, `GetActiveByUserIdAsync`, `UpdateAsync`
- **Notes**: EF Core. Tokens stored as hashes.

## BanRepository

- **Interface**: `IBanRepository`
- **Location**: `Infrastructure/Repositories/BanRepository.cs`
- **Operations**: `AddAsync`, `GetByIdAsync`, `GetActiveByUserIdAsync`, `GetAllByUserIdAsync`, `GetPagedAsync`
- **Notes**: EF Core. `GetActiveByUserIdAsync` returns currently active ban (StartDate <= now AND (EndDate IS NULL OR EndDate > now)). `GetAllByUserIdAsync` returns all historical bans. `GetPagedAsync` returns paginated `BanListItemDto` projections with search, filters, ordering, pagination. Bans preserved as historical records; not physically deleted. **Indexes**: `StartDate`, `UserId` (added 2026-09, was the most expensive missing index — admin views scan all bans of a user).

## ImageRepository

- **Interface**: `IImageRepository`
- **Location**: `Infrastructure/Repositories/ImageRepository.cs`
- **Operations**: `GetByIdAsync`, `AddAsync`, `Remove`
- **Notes**: EF Core. Returns Image entities by identifier. Used by ImagesController to serve stored images. `Remove` is used by `CbrProcessingJob` cleanup to delete orphan Images after a retry. There is **no** `Image.OwnerEntityType` / `OwnerEntityId` polymorphic ownership in this model — the audit of 2026-09 incorrectly listed these as missing indexes. The model uses a single `Files` table with a discriminator (`File` / `Image`) and `Type` (enum: `Avatar`, `Cover`, `Page`, `Profile`).