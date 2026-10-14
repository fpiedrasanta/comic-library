# Domain — Users

## User

- **Location**: `Domain/Entities/User.cs`
- **Fields**:
  - `long Id`
  - `string FirstName`
  - `string LastName`
  - `string Email` (unique at DB level)
  - `string PasswordHash`
  - `virtual Country? Nationality`
  - `virtual Image? Avatar`
  - `string? AvatarUrl`
  - `UserRole Role` (default `UserRole.PublicUser`)
  - `bool IsEmailValidated`
  - `string? EmailValidationToken`
  - `DateTime? EmailValidationTokenExpiresAt`
  - `DateTime CreatedAt`
  - `DateTime UpdatedAt`
  - `bool IsActive` (default `true`)
  - `virtual60;RefreshToken> RefreshTokens`
  - `virtual60;PasswordResetToken> PasswordResetTokens`
  - `virtual60;PasswordResetAuthorization> PasswordResetAuthorizations`
- **Notes**: Soft-delete via `IsActive`. `IsEmailValidated` and `EmailValidationToken` control email verification flow. Role is `UserRole` enum (`PublicUser` or `Administrator`). No `IsBanned` or `BanEndDate` denormalized fields — ban status is derived from the `Bans` table.

## Ban

- **Location**: `Domain/Entities/Ban.cs`
- **Fields**:
  - `long Id`
  - `virtual User User`
  - `DateTime StartDate`
  - `DateTime? EndDate` (null = permanent)
  - `string Reason`
  - `bool IsActive`
  - `DateTime CreatedAt`
- **Notes**: Bans are not physically deleted. `IsActive` flips to `false` when a ban is manually lifted; the row remains for audit. `GetActiveByUserIdAsync` returns the currently active ban (`StartDate <= now AND (EndDate IS NULL OR EndDate > now) AND IsActive = true`). `GetAllByUserIdAsync` returns the full history.

## RefreshToken

- **Location**: `Domain/Entities/RefreshToken.cs`
- **Fields**:
  - `long Id`
  - `virtual User User`
  - `string TokenHash`
  - `DateTime CreatedAt`
  - `DateTime ExpiresAt`
  - `DateTime? RevokedAt`
  - `bool IsUsed`
- **Notes**: Tokens stored as hashes, never plain text. `IsUsed` flips on consumption. `RevokedAt` is set by logout-all. **Indexes**: `UserId`, `(IsUsed, ExpiresAt)` — the composite index supports the "find active token by user" lookup.

## PasswordResetToken

- **Location**: `Domain/Entities/PasswordResetToken.cs`
- **Fields**:
  - `long Id`
  - `virtual User User`
  - `string TokenHash`
  - `DateTime CreatedAt`
  - `DateTime ExpiresAt`
  - `DateTime? UsedAt`
- **Notes**: Reset codes stored as hashes. `UsedAt` marks consumption.

## PasswordResetAuthorization

- **Location**: `Domain/Entities/PasswordResetAuthorization.cs`
- **Fields**:
  - `long Id`
  - `virtual User User`
  - `string TokenHash`
  - `DateTime CreatedAt`
  - `DateTime ExpiresAt`
  - `DateTime? UsedAt`
- **Notes**: Authorization tokens (different from reset codes) — used to authorize the final password-change step. `UsedAt` marks consumption.

## AccountDeletionToken

- **Location**: `Domain/Entities/AccountDeletionToken.cs`
- **Fields**:
  - `long Id`
  - `virtual User User`
  - `string TokenHash`
  - `DateTime CreatedAt`
  - `DateTime ExpiresAt`
  - `DateTime? UsedAt`
- **Notes**: Tokens stored as hashes. Used by the account-deletion flow. `UsedAt` marks consumption.