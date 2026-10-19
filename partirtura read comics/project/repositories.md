# Repositories â€” Index

Quick reference for repository interfaces and their operations. The per-module details live in the per-module files under `repositories/`.

## File index

| File | Contents |
| --- | --- |
| `repositories/repositories-users.md` | UserRepository, RefreshTokenRepository, PasswordResetTokenRepository, PasswordResetAuthorizationRepository, AccountDeletionTokenRepository, BanRepository, ImageRepository |
| `repositories/repositories-catalog.md` | CountryRepository, PublisherRepository, FranchiseRepository, SeriesRepository, LanguageRepository, PersonRepository, RoleRepository, TagRepository, ListTypeRepository, WorkListRepository, WorkRepository, WorkTypeRepository, FavoriteRepository |
| `repositories/repositories-numbers.md` | PageRepository, UnitOfWork |

## Conventions (enforced as of 2026-09 audit)

- Every read-only query ends with `.AsNoTracking()`.
- Every query with 3 or more `Include`/`ThenInclude` calls uses `.AsSplitQuery()` to avoid Cartesian explosion.
- Every FK column has a corresponding `HasIndex` in the EF configuration. Shadow FKs use the `HasIndex("ColumnName")` string overload.
- No `IQueryable<T>` is exposed in interfaces. Repositories return `Task<T>`, `Task<(IReadOnlyList<T>, int)>`, or already-materialized DTOs.
- No `DbSet.Remove` / `DbSet.RemoveRange`. Deactivation uses `IsActive = false`.
  - **Exception**: `FavoriteRepository.RemoveAsync` performs a physical deletion. US-0035 requires that removing a
    favorite deletes its record instead of deactivating it, and the `Favorite` entity has no `IsActive` property.

## Quick reference

| Repository | Interface | Operations count |
| --- | --- | --- |
| UserRepository | `IUserRepository` | 10 |
| CountryRepository | `ICountryRepository` | 6 |
| PublisherRepository | `IPublisherRepository` | 7 |
| FranchiseRepository | `IFranchiseRepository` | 6 |
| SeriesRepository | `ISeriesRepository` | 7 |
| LanguageRepository | `ILanguageRepository` | 2 |
| PersonRepository | `IPersonRepository` | 5 |
| RoleRepository | `IRoleRepository` | 5 |
| ListTypeRepository | `IListTypeRepository` | 5 |
| WorkListRepository | `IWorkListRepository` | 5 |
| WorkRepository | `IWorkRepository` | 6 |
| WorkTypeRepository | `IWorkTypeRepository` | 7 |
| PageRepository | `IPageRepository` | 6 |
| WorkReadingProgressRepository | `IWorkReadingProgressRepository` | 4 |
| WorkRatingRepository | `IWorkRatingRepository` | 8 |
| UnitOfWork | `IUnitOfWork` | 3 |
| RefreshTokenRepository | `IRefreshTokenRepository` | 4 |
| PasswordResetTokenRepository | `IPasswordResetTokenRepository` | 4 |
| PasswordResetAuthorizationRepository | `IPasswordResetAuthorizationRepository` | 3 |
| AccountDeletionTokenRepository | `IAccountDeletionTokenRepository` | 4 |
| BanRepository | `IBanRepository` | 5 |
| ImageRepository | `IImageRepository` | 3 |
| FavoriteRepository | `IFavoriteRepository` | 5 |