# Backend Coding Rules � API & Infrastructure

## Dependency Injection

- All dependencies injected. No manual instantiation of infrastructure dependencies in Application classes.
- **No Service Locator.** No `IServiceProvider.GetRequiredService<T>()` inside services. The audit found this in `CbrProcessingJob` and the design decision is documented (Hangfire requires it; this is the one exception). Every other service must take its dependencies in the constructor.
- Configuration in composition root (`Program.cs`).
- When `Program.cs` has more than 50 `AddScoped` lines, refactor into `AddApplicationServices()` and `AddInfrastructureRepositories()` extension methods. Until then, keep them inline in `Program.cs` so they are easy to scan.

## Async/Await

- All I/O operations use async/await. No `.Result` or `.Wait()`.
- Database, files, HTTP, external services must be async.

## CancellationToken

- Propagate CancellationToken through async operations: HTTP requests, database queries, file processing, external calls, background jobs.

## Logging

- Use centralized logging (Serilog). No `Console.WriteLine()`.
- Every service that has business logic must inject `ILogger<TService>`. Log `LogInformation` on successful operations, `LogWarning` on rejected business events (e.g. failed login, ban applied), `LogError` on unexpected exceptions.
- Log context: timestamp, level, request ID, user ID when appropriate, operation, duration, error info.
- **Never log: passwords, access tokens, refresh tokens, secret keys, credentials, unnecessary sensitive info, private user content without justification.** The `SensitiveDataRedactionEnricher` redacts property names in the sensitive list, but the contract is: do not even put them in the log call.
- Never log a `catch` block silently. If you catch, you log.

## Sensitive information

- Never store in repo: passwords, API keys, JWT secrets, OAuth secrets, connection strings with credentials, tokens.
- Code must work with external configuration.
- Never hardcode JWT secrets, API keys, or any credential in source. Configuration values must come from `IConfiguration` and be validated at startup (e.g. `JwtOptionsValidator` rejects empty / too-short / placeholder JWT secrets before the app accepts a request).

## Comments

- Code should be clear enough to minimize comments.
- Comments explain: non-obvious decisions, external constraints, architectural reasons, necessary workarounds, complex behaviors not expressible in code.
- No comments explaining obvious code.

## Dead code

- No dead code: unused methods, variables, classes, commented code, abandoned implementations.
- Git history is the mechanism to recover old code.

## Duplication

- No unnecessary duplication. Extract when same rule repeats.
- No premature abstraction just to avoid two similar lines. Abstraction must improve clarity.
- Before adding a new helper, check `Application/Helpers/`, `Infrastructure/Persistence/`, `Api/Helpers/`, `Api/Middleware/`. The helper you need probably already exists.

## Clarity

- Prefer readability over conciseness.
- Prefer explicit over clever.

## Configurable values

- No hardcoded expiration durations, rate limits, storage paths, or any value that should change by environment or operational decision.
- Use `appsettings.json` or environment variables via `IConfiguration`.
- If a value appears in multiple places, define it once and reuse it.

## Rate limiting

Sensitive endpoints must have a rate limiting policy. The policies are in `Application/Constants/RateLimitPolicies.cs` and the registration is in `Api/Middleware/RateLimiterConfiguration.cs`. The current mapping:

| Policy | Limit | Window | Endpoints |
|--------|-------|--------|-----------|
| `AuthRegister` | 5 | 1 hour | `POST /api/users/register` |
| `AuthLogin` | 10 | 15 min | `POST /api/users/login` |
| `AuthGoogleLogin` | 10 | 15 min | `POST /api/users/google-login` |
| `AuthRefresh` | 30 | 1 min | `POST /api/users/refresh-token` |
| `AuthForgotPassword` | 5 | 1 hour | `POST /api/users/forgot-password` |
| `AuthResendCode` | 3 | 1 hour | `POST /api/users/resend-validation-email`, `POST /api/users/resend-password-reset-code` |
| `AuthAccountDeletion` | 5 | 1 hour | `POST /api/users/account-deletion/request`, `POST /api/users/account-deletion/confirm` |
| `AdminAiAnalysis` | 10 | 1 hour | `POST /api/admin-works/{workId}/ai-analysis` |

When you add a new sensitive endpoint (password change, email change, 2FA, payment, anything that can be brute-forced or is expensive), add a rate limiting policy in the same file. Anonymous endpoints are partitioned by IP; authenticated endpoints are partitioned by user ID.

## Background jobs

- A Hangfire job that mutates persistent state must be **idempotent**. Add `[DisableConcurrentExecution(timeoutInSeconds)]` to the method. Verify the `ContentStatus` (or equivalent state machine) before doing work. If the work is already done, exit early.
- A Hangfire job must batch its `SaveChanges` calls. Use a `BatchSize` constant. Default is 20.
- A Hangfire job that processes a file must clean up the file in a `finally` block. Use a try/catch around the cleanup so cleanup failures do not throw.
- A Hangfire job that processes a file must validate the file path with `CbrFileValidator.IsPathWithinTempRoot(path, contentRootPath)` to prevent path traversal.
- A Hangfire job that takes dependencies on scoped services (anything from the DbContext) must use a `using` scope inside the method. Injecting scoped services in the constructor is a leak (the audit found this pattern; the design is intentionally a single service-provider constructor for `CbrProcessingJob`).
- Background jobs are tests, even when they look hard. At minimum, verify the policy attributes, the batch size, the disable-concurrent timeout, and the queue name. Use reflection (`GetCustomAttributes`) in the test, not integration with Hangfire.

## CORS

- `Cors:AllowedOrigins` must be configured in `appsettings.json` for production.
- In production, the app fails to start if `Cors:AllowedOrigins` is empty or missing.
- In development, the policy falls back to `SetIsOriginAllowed(_ => true)`. Do not change this; it lets you run locally without configuring CORS.

## Email

- SMTP or explicit email provider. No stubs that only log.
- Read SMTP config from configuration. No hardcoded credentials or template paths.
- Support configurable HTML templates. Replace placeholders.
- No sensitive info in logs. Throw or log error on failure.

## Safe error messages

- Auth/authorization errors return generic friendly messages. Never return: `Invalid token`, `JWT validation failed`, `Token expired`, `Signature validation failed`, stack traces, internal class names, internal exception messages.
- Minimum client message: `Se generó un error durante el proceso de autenticación.`
- Technical details go to logs via `ILogger`, separated from client message.
- Logs must never contain: full access tokens, full refresh tokens, secret keys, credentials.

## Logical deletion

- No physical deletion of persisted records as part of functional operations.
- All persisted entities must have `IsActive`.
  - `IsActive = true`: active and available.
  - `IsActive = false`: logically deactivated.
- Entities with their own state mechanism (e.g., `RefreshToken` with `RevokedAt`, `PasswordResetToken` with `UsedAt`) respect their own model.
- **Do not use Global Query Filters for `IsActive`.** The audit considered this and rejected it: some operations legitimately need to see inactive records (ban history, admin views, audits). The service layer decides the filter per use case. The current pattern is correct and must be preserved.
- Prohibited: `DbSet.Remove`, `DbSet.RemoveRange`, SQL `DELETE`, repository methods that execute physical deletion for functional deactivation.
- Physical file deletion from filesystem is allowed when appropriate (e.g., avatar replacement, image orphan cleanup in `CbrProcessingJob`).

## Image operations

- When an image belongs to a business entity, its creation, replacement, conservation, or deletion must be part of that entity's create/update operation.
- No CRUD image endpoints per entity unless explicit business need.
- Operations with entity + image must use `multipart/form-data`.
- Use `IImageUploadService` for every image write. The service handles rollback on DB failure. Do not call `IFileStorageService.SaveAsync` directly from a service.

## Refactor guardrails (learned the hard way)
