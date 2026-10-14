# Infrastructure Services

Technical services implementing capabilities. Must not orchestrate use cases or hide Application behavior.

## EmailService

- **Location**: `Infrastructure/Services/EmailService.cs`
- **Dependencies**: `IConfiguration`
- **Behavior**: Reads HTML and plain text templates from configured relative paths. Replaces `{{code}}` and `{{time to expire}}` placeholders. Sends via SMTP using MailKit with multipart content. Does not log sensitive data. Throws on send failure.
- **Configuration**: `Email:Smtp:Host`, `Email:Smtp:Port`, `Email:Smtp:User`, `Email:Smtp:Pass`, `Email:Smtp:From`, `Email:Smtp:FromName`, `ValidationMailContent:Subject`, `ValidationMailContent:HtmlTemplatePath`, `ValidationMailContent:TextTemplatePath`, `ValidationMailContent:TokenExpirationMinutes`
- **Notes**: SMTP credentials via env vars or secure config, not in repo. Template paths relative to Api project. Templates copied to output during build. Missing template file omits that part. SMTP config is generic; template config is specific to email validation.

## GoogleAuthenticationService

- **Location**: `Infrastructure/Services/GoogleAuthenticationService.cs`
- **Dependencies**: `IConfiguration`, `Google.Apis.Auth`
- **Behavior**: Validates Google ID token using Google public keys. Validates issuer and audience (ClientId). Validates expiration. Extracts email, first name, last name, avatar URL. Does not store or log Google token. Does not return Google token to caller.
- **Configuration**: `Google:ClientId`, `Google:ClientSecret`
- **Notes**: Returns `GoogleUserInfo` DTO. Does not access repositories or implement business logic. Does not create users or generate JWTs. Application does not depend on Google-specific types.

## GoogleClientSettingsProvider

- **Location**: `Infrastructure/Settings/GoogleClientSettingsProvider.cs`
- **Dependencies**: `IConfiguration`
- **Behavior**: Reads Google Client ID from config. Throws `BusinessNotFoundException` if not configured. Never exposes Client Secret.
- **Configuration**: `Google:ClientId`
- **Notes**: Used by Presentation to expose Client ID to Public Web. Does not access repositories.

## PasswordHasher

- **Location**: `Infrastructure/Services/PasswordHasher.cs`
- **Dependencies**: `Microsoft.AspNetCore.Identity`
- **Behavior**: Hashes passwords using `PasswordHasher<User>`. Verifies plain passwords against stored hashes. Used during registration and login.
- **Notes**: Does not store or log plain passwords.

## JwtTokenGenerator

- **Location**: `Infrastructure/Services/JwtTokenGenerator.cs`
- **Behavior**: Reads JWT config from appsettings. Generates signed JWT with user claims (sub, email, name). Includes persisted role as `role` claim. Does not store or validate tokens.
- **Configuration**: `Jwt:Issuer`, `Jwt:Audience`, `Jwt:SecretKey`, `Jwt:ExpirationMinutes`

## RefreshTokenGenerator

- **Location**: `Infrastructure/Services/RefreshTokenGenerator.cs`
- **Behavior**: Generates 64-byte random value, Base64Url encoded. Returns raw token string only at generation time. Never stored in plain text.

## RefreshTokenHasher

- **Location**: `Infrastructure/Services/RefreshTokenHasher.cs`
- **Behavior**: Computes SHA256 hash of raw token, Base64Url encoded. Returns hash for storage.
- **Notes**: Hashes stored in database, not raw tokens.

## RefreshTokenCookieSettingsProvider

- **Location**: `Infrastructure/Settings/RefreshTokenCookieSettingsProvider.cs`
- **Dependencies**: `IConfiguration`
- **Behavior**: Reads cookie name, HttpOnly, Secure, SameSite from config. Reads expiration days from `RefreshToken:ExpirationDays`.
- **Configuration**: `Cookies:RefreshToken:Name`, `Cookies:RefreshToken:HttpOnly`, `Cookies:RefreshToken:Secure`, `Cookies:RefreshToken:SameSite`, `RefreshToken:ExpirationDays`
- **Notes**: Returns config values; does not directly set cookies.

## PasswordResetCodeService

- **Location**: `Infrastructure/Services/PasswordResetCodeService.cs`
- **Dependencies**: `IConfiguration`
- **Behavior**: Generates 6-digit numeric codes with leading zeros using cryptographically secure random. Hashes using SHA256 before storage. Validates raw codes against stored hashes using constant-time comparison.
- **Configuration**: `PasswordReset:CodeExpirationMinutes`
- **Notes**: Raw codes never persisted or logged. Used for password recovery only.

## PasswordResetAuthorizationService

- **Location**: `Infrastructure/Services/PasswordResetAuthorizationService.cs`
- **Behavior**: Generates cryptographically secure random tokens. Hashes using SHA256. Validates raw tokens against stored hashes using constant-time comparison. Returns both raw token and hash for one-time use.
- **Notes**: Raw authorization tokens never persisted. Used exclusively for password reset flow. Not a JWT or general auth mechanism.

## AccountDeletionCodeService

- **Location**: `Infrastructure/Services/AccountDeletionCodeService.cs`
- **Behavior**: Generates 6-digit numeric codes with leading zeros using cryptographically secure random. Hashes using SHA256 before storage. Validates raw codes against stored hashes using constant-time comparison.
- **Notes**: Raw codes never persisted or logged. Used exclusively for account deletion flow.

## FileStorageService

- **Location**: `Infrastructure/Services/FileStorageService.cs`
- **Dependencies**: `IWebHostEnvironment`
- **Behavior**: `SaveAsync` stores image as WebP, resizes avatars to 256px max, generates GUID filename, persists to `Storage/Images` under `ContentRootPath`. `DeleteAsync` resolves physical path from relative `StoragePath` and deletes file. `GetPhysicalPath` resolves relative path to absolute using `ContentRootPath`. If already rooted, returns as-is.
- **Configuration**: Storage directory: `Path.Combine(ContentRootPath, "Storage", "Images")`
- **Notes**: Does not expose internal server paths. Physical file deletion only after DB transaction succeeds (orchestrated by calling service).

## PasswordValidator

- **Location**: `Infrastructure/Services/PasswordValidator.cs`
- **Behavior**: Validates min 8 chars, at least one digit, one lowercase, one uppercase, one special character. Returns error message on failure.
- **Notes**: Reusable across registration and password reset. Does not store or log passwords.

## InitialAdminSeeder

- **Location**: `Infrastructure/Seed/InitialAdminSeeder.cs`
- **Dependencies**: `IUserRepository`, `IPasswordHasher`, `IUnitOfWork`, `IConfiguration`, `ILogger<InitialAdminSeeder>`
- **Behavior**: Reads initial admin email/password from config (`Admin:InitialEmail`, `Admin:InitialPassword`). If missing, logs error and does not create. If no user with email exists, creates user with Administrator role, hashed password, validated email. If user exists without Administrator role, assigns role without changing password. Idempotent.
- **Notes**: Initial password via secure config or env vars; must not be committed. Executed once at startup after migrations. DB uniqueness on email is authority; tolerates concurrent creation race.
