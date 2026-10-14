# Backend Coding Rules — Index

Mandatory coding rules for the backend. Agents and humans must follow them unless an explicit architectural decision says otherwise. These rules exist to prevent the kind of drift that produced the 30-finding audit of 2026-09-03 (see `refactor-audit-2026-09-03.md`). Read that document once so you understand **why** each rule is here.

## Quick Reference

### HTTP status codes

| Code | Meaning |
| --- | --- |
| 200 OK | Read or update that did not create a resource |
| 201 Created | POST that creates a resource — must include `Location` header |
| 204 No Content | Not currently used |
| 400 Bad Request | Malformed request |
| 401 Unauthorized | Missing or invalid bearer token / refresh token |
| 403 Forbidden | Authenticated but missing required role |
| 404 Not Found | Entity does not exist or `IsActive = false` |
| 409 Conflict | Duplicate or invalid state transition |
| 422 Unprocessable Entity | `ValidationException` and `BusinessException` |
| 429 Too Many Requests | `RateLimitExceededException` (returned by rate limiter) |
| 500 Internal Server Error | Unexpected exception |

### Naming

- Meaningful names. No abbreviations, single letters, numbered variables, generic names.
- Private fields: `camelCase`.
- Public members: `PascalCase`.
- Same concept = same name everywhere. No `Comic`, `Book`, `Publication` for the same entity.
- No magic numbers or strings. Use named constants, enums, or configuration.

### Async/Await

- All I/O operations use async/await. No `.Result` or `.Wait()`.
- Database, files, HTTP, external services must be async.
- Propagate `CancellationToken` through async operations.

### Error handling

- Centralized exception handling. No error codes or boolean returns for exceptional conditions.
- Throw specific exceptions: `BusinessNotFoundException`, `BusinessConflictException`, `ValidationException`, `InvalidCredentialsException`, `RateLimitExceededException`.
- Every `catch` block either re-throws or logs the full exception with `ILogger.LogX(ex, "contextual message", ...)`. **No empty `catch {}` blocks.**

### Logical deletion

- No physical deletion of persisted records as part of functional operations.
- All persisted entities must have `IsActive`.
- **Do not use Global Query Filters for `IsActive`.** The service layer decides the filter per use case.
- Prohibited: `DbSet.Remove`, `DbSet.RemoveRange`, SQL `DELETE`, repository methods that execute physical deletion for functional deactivation.

### File index

| File | Contents |
| --- | --- |
| `backend-coding-rules-general.md` | Tests, Language, Naming, Functions, Error handling, HTTP, API responses, Pagination, Search, Dates, Private fields, Public members, Identifiers, DTOs, Mappers, Layer rules, Service boundaries |
| `backend-coding-rules-ef.md` | Repository pattern, Helpers (DRY), Unit of Work, Relationships, Lazy loading, AsNoTracking policy |
| `backend-coding-rules-api.md` | Dependency Injection, Async/Await, CancellationToken, Logging, Sensitive information, Comments, Dead code, Duplication, Clarity, Configurable values, Rate limiting, CORS, Email, Safe error messages, Logical deletion, Image operations |
| `backend-coding-rules-jobs.md` | Background jobs, Refactor guardrails, Agent rules, Code quality |

## Agent rules

- Respect these rules.
- Maintain existing architecture.
- No new patterns without justification.
- No replace existing abstractions without explicit decision.
- No arbitrary public contract changes.
- No duplicate existing logic.
- Consistent nomenclature.
- **Run tests after every change.** The minimum is `dotnet test` on the projects you touched. If you touched the API, also `dotnet build` on `api/Api/Api.csproj` to confirm 0 errors.
- Fix errors introduced by own changes.
- No unrelated modifications.
- No general refactors not needed for the task.
- Minimal changes. Minimize impact area.