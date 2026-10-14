# Domain — Overview

## Model structure

Domain entities are simple C# classes in `Domain/Entities/`. There is **no common base class** (`BaseEntity` does not exist). Each entity declares its own `Id`, `CreatedAt`, and optionally `UpdatedAt`/`IsActive` properties directly.

The model is intentionally flat: no soft-delete column called `DeletedAt`; deactivation uses the `IsActive` boolean where applicable, and historical records (bans) keep their rows forever.

## Common patterns

| Pattern | Entities |
| --- | --- |
| `long Id` (auto-increment) | All entities |
| `DateTime CreatedAt` | Most entities |
| `bool IsActive` | Country, Publisher, Franchise, Series, Person, Role, User, Ban, File, Work |
| `DateTime UpdatedAt` | User only |
| `DateTime? RevokedAt` | RefreshToken |
| `DateTime? UsedAt` | PasswordResetToken, PasswordResetAuthorization, AccountDeletionToken |
| `virtual` navigation properties | User, Ban, RefreshToken, Publisher, Franchise, Series, Work, PersonByRole, TagByWork, Page, Image |

## Inheritance

- `File` (abstract) ? `Image` — Image adds Width, Height, Type
- All other entities are standalone classes

## Key conventions

- `Id` is `long`, positive, auto-incremental, required. No GUIDs for main entities.
- `0` means not persisted. No negative IDs. No special values like -1, -99.
- No IDs as business logic. No `if (publisherId == 1)`.
- No physical deletion of persisted records. Logical deactivation via `IsActive = false` where applicable.
- Entities with their own state mechanism (RefreshToken with `RevokedAt`, tokens with `UsedAt`) respect their own model.
- **Do not use Global Query Filters for `IsActive`.** The service layer decides the filter per use case.