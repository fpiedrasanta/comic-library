# Backend Technology Stack

## Core

| Area | Technology | Version |
|------|-----------|---------|
| Language | C# | 14 |
| Runtime | .NET | 10 LTS |
| API | ASP.NET Core | 10 |
| ORM | Entity Framework Core | 10 |
| Lazy Loading | EF Core Proxies | — |
| Database | MySQL | 8.x |
| MySQL Provider | MySql.EntityFrameworkCore | 10.0.9 |
| Schema Management | EF Core Migrations | — |
| Architecture | Clean Architecture / Modular Monolith | — |
| Authentication | ASP.NET Core Identity | — |
| External Auth | Google OAuth 2.0 / OpenID Connect | — |
| Google Library | Microsoft.AspNetCore.Authentication.Google | 10.0.0 |
| API Authentication | JWT Bearer | — |
| Session Renewal | Refresh Tokens (HttpOnly cookies) | — |
| Background Jobs | Hangfire | 1.8.24 (storage pendiente: MySQL en evaluación, SQL Server como alternativa oficial) |
| CBR Extraction | SharpCompress | 0.50.4 |
| Image Conversion | Magick.NET-Q8-AnyCPU | 14.16.0 |
| Page Format | WebP | — |
| Email Delivery | MailKit | 4.17.0 |
| Primary Storage | Filesystem | — |
| Logging | Serilog | — |
| Observability | OpenTelemetry | — |
| API Contract | OpenAPI | — |
| Rate Limiting | ASP.NET Core 10 RateLimiter middleware | — |
| Logging redaction | Serilog.Core.ILogEventEnricher (custom) | — |

## Key Packages

| Package | Version | Layer |
|---------|---------|-------|
| Microsoft.EntityFrameworkCore.Proxies | 10.0.11 | Infrastructure |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.11 | Api |
| Microsoft.EntityFrameworkCore | 10.0.11 | Infrastructure |
| Microsoft.EntityFrameworkCore.Relational | 10.0.11 | Infrastructure |
| Microsoft.AspNetCore.Identity.EntityFrameworkCore | 10.0.11 | Infrastructure |
| Microsoft.EntityFrameworkCore.Tools | 10.0.11 | Infrastructure (dev) |
| MySql.EntityFrameworkCore | 10.0.9 | Infrastructure |
| Hangfire.AspNetCore | 1.8.24 | Infrastructure, Api (only the dashboard `AddHangfire` call) |
| Hangfire.Core | 1.8.24 | Infrastructure |
| Hangfire.Storage.MySql | 2.0.1-beta | Infrastructure (storage persistente de Hangfire — volumen bajo, mitigaciones aplicadas) |
| Magick.NET-Q8-AnyCPU | 14.16.0 | Infrastructure |
| MailKit | 4.17.0 | Infrastructure |
| SharpCompress | 0.50.4 | Infrastructure |
| Google.Apis.Auth | 1.64.0 | Infrastructure |
| System.IdentityModel.Tokens.Jwt | 8.22.0 | Infrastructure |
| Microsoft.Extensions.Logging.Abstractions | 10.0.0 | Application (explicit; used by services with `ILogger<T>`) |
| Microsoft.Extensions.Options | 10.0.0 | Application (explicit; used by `JwtOptions` + `JwtOptionsValidator`) |
| Serilog.AspNetCore | (latest 10.x) | Api |
| Serilog.Settings.Configuration | (latest 10.x) | Api |

## Removed packages

| Package | Why it was removed |
|---------|-------------------|
| ~~`Hangfire.AspNetCore` from `Application.csproj`~~ | Hangfire is infrastructure. The package was pulled in transitively before but `Application` does not use it. Removed in 2026-09 audit. |
| ~~`Hangfire.MySqlStorage`~~ | No compila para .NET 10 (solo `net452`/`netstandard2.0`). Reemplazado por `Hangfire.Storage.MySql` 2.0.1-beta. |
| ~~`Hangfire.MySqlStorage`~~ | No compila para .NET 10 (solo `net452`/`netstandard2.0`). Reemplazado por evaluación de `Hangfire.Storage.MySql` 2.0.1-beta (en evaluación). |
| ~~`Hangfire.SqlServer`~~ | No se adoptó como storage definitivo. Disponible como alternativa oficial si se requiere SQL Server. |
| ~~`Hangfire.Redis`~~ | Deprecado, ahora parte de Hangfire Pro (pago). No viable sin licencia. |

## Layer dependency rules (enforced)

The NuGet graph below is intentional. A package referenced by `Application` must be used by Application code (interfaces, services, helpers, mappers, DTOs). A package used only by `Infrastructure` code must live in `Infrastructure.csproj`. A package used only by `Api` code (middleware, controllers) must live in `Api.csproj`.

```
Domain        → (no NuGet, no project refs)
Application   → Domain, Microsoft.Extensions.Logging.Abstractions, Microsoft.Extensions.Options
Infrastructure → Application, Domain, EF Core, MySQL provider, Hangfire, SharpCompress, Magick.NET, MailKit, Google.Apis.Auth
Api           → Application, Domain (transitive), Infrastructure, ASP.NET Core, Serilog
```

Any deviation is a bug. The audit of 2026-09 found that `Hangfire.AspNetCore` had leaked into `Application.csproj`; it was removed.

## Configuration

| Variable | Purpose | Validated at startup |
|----------|---------|----------------------|
| `Database:DefaultConnection` | MySQL connection string | No |
| `Jwt:SecretKey` | JWT signing key | **Yes** — must be ≥32 chars, not empty, not the development placeholder |
| `Jwt:Issuer` | JWT issuer | **Yes** — required |
| `Jwt:Audience` | JWT audience | **Yes** — required |
| `Jwt:ExpirationMinutes` | Access token lifetime | **Yes** — 1..1440 |
| `RefreshToken:ExpirationDays` | Refresh token lifetime | No |
| `RefreshToken:MaxPerUser` | (if present) | No |
| `Google:ClientId` | Google OAuth client ID | No |
| `Email:Smtp:*` | SMTP configuration | No |
| `Admin:InitialEmail` | Initial admin email | No |
| `Admin:InitialPassword` | Initial admin password | No |
| `Cors:AllowedOrigins` | Allowed CORS origins | **Yes** — empty array in production causes startup failure |
| `AI:Provider` | Selected AI provider (`Gemini`, `OpenRouter`, `Ollama`) | No |
| `AI:Gemini:ApiKey` | Google Gemini API key | No |
| `AI:OpenRouter:ApiKey` | OpenRouter API key | No |
| `AI:Ollama:Endpoint` | Ollama local endpoint | No |

## Seeing SQL queries in development

`appsettings.Development.json` raises the Serilog level of `Microsoft.EntityFrameworkCore.Database.Command`
to `Information`, so the console and `Logs/comiclibrary-*.log` show **every SQL statement** with its
parameters and duration. Use it to detect N+1 problems: a list endpoint should show one query per
result set (plus the `COUNT` for pagination), never one query per item.

Parameter values are logged as `?`. Do **not** enable `EnableSensitiveDataLogging()` globally: queries
receive tokens and other secrets as parameters. Enable it temporarily (Development only) when debugging
a specific statement.

Production keeps the `Microsoft` override at `Warning`, so the SQL is not logged there.

## Constraints

- Stable compatibility over latest version.
- No preview/nightly/experimental packages in production.
- No generic repository (`IRepository<T>`).
- No Service Locator (the one exception is `CbrProcessingJob` which uses `IServiceProvider` because Hangfire instantiates the job outside a request scope — this is documented in `CbrProcessingJob.cs`).
- No manual `HttpClient` instantiation (use `IHttpClientFactory`). All AI providers use `IHttpClientFactory` via `AddHttpClient<T>(...)`.
- `Database.Migrate()` is not used in production startup; migrations are applied during deployment.
- No `Console.WriteLine` for diagnostics; use `ILogger`.
- No `DbSet.Remove` / `DbSet.RemoveRange` for functional deactivation. Use `IsActive = false`.
- No hardcoded secrets, retry counts, or rate limits in source. Use named constants at the top of the file or `IConfiguration`.
- No `IQueryable` exposed in repository interfaces. Return materialized results.
- Every read-only repository query ends with `.AsNoTracking()`. Every query with 3+ Includes uses `.AsSplitQuery()`.

## Known issues / Technical debt

- **System.Data.SqlClient:** Dependencia transitiva de EF Core 10.0.11 (advisories NU1902/NU1903). No se puede eliminar sin actualizar paquetes. Evaluar en próxima auditoría de seguridad.
