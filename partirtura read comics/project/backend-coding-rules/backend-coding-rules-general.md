# Backend Coding Rules � General


## Purpose

Mandatory coding rules for the backend. Agents and humans must follow them unless an explicit architectural decision says otherwise. These rules exist to prevent the kind of drift that produced the 30-finding audit of 2026-09-03 (see `refactor-audit-2026-09-03.md`). Read that document once so you understand **why** each rule is here.

## Tests (mandatory for all new code)

- Every new code path (new method, new branch, new validation, new helper) has unit tests in the same PR.
- Every new public method on a service has at least one happy-path test and at least one error-path test (or `Theory` with multiple inputs).
- A refactor is not done until the existing tests still pass green and new tests cover the new behavior.
- Do not delete or skip tests to make the suite pass. If a test fails after your change, fix the test or fix the code — never `.Skip()` it.
- Coverage of `Application/Services/` and `Application/Helpers/` is the agent's responsibility. Coverage of `Infrastructure/Repositories/` and `Infrastructure/Jobs/` is the agent's responsibility when the change is testable without a real DB. When a real DB is required (e.g. for EF query behavior), the test is `OPEN` and you must say so in the PR description.

## Language

All code in English. No Spanish in code: namespaces, classes, methods, variables, properties, fields, enums, exceptions, comments, log messages.

## Naming

- Meaningful names. No abbreviations, single letters, numbered variables, generic names.
- Private fields: camelCase.
- Public members: PascalCase.
- Same concept = same name everywhere. No `Comic`, `Book`, `Publication` for the same entity.
- No magic numbers or strings. Use named constants, enums, or configuration.

## Functions

- Single responsibility. One function = one operation.
- Small: max 15 lines of code.
- Explicit names that describe behavior. Avoid `Process`, `Handle`, `Execute`, `Do`, `Run`, `Manage`, `Update` when they don't describe the operation.
- One level of abstraction per function. No mixing domain language with infrastructure details.
- No hidden behavior. A function named `Get` must not modify, save, create, or execute external operations.

## Error handling

- Centralized exception handling. No error codes or boolean returns for exceptional conditions.
- Throw specific exceptions: `BusinessNotFoundException`, `BusinessConflictException`, `ValidationException`, `InvalidCredentialsException`, `RateLimitExceededException`.
- Global exception handler maps exceptions to HTTP status codes. Controllers must not contain repeated exception handling logic.
- Every `catch` block either re-throws or logs the full exception with `ILogger.LogX(ex, "contextual message", ...)`. **No empty `catch {}` blocks.** This was an audit finding.

## HTTP

Use correct status codes:

- 200 OK
- 201 Created — POST that creates a resource must return 201 with `Location` header via `CreatedAtAction` or `CreatedAtRoute`. Returning 200 on POST is a bug.
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity — input is syntactically valid but semantically rejected (validation, business rule). `ValidationException` maps to 422.
- 500 Internal Server Error
- 429 Too Many Requests — returned by the rate limiter. Do not return manually.

Business errors must not become 500 arbitrarily.

## API responses

Standard wrapper: `ApiResponse<T>`.
- Simple resource: `payload` is the DTO.
- Paginated collection: `payload` is `ListResponse<TDto>` with `items`, `currentPage`, `totalPages`, `pageSize`, `totalCount`, `hasNextPage`, `hasPriorPage`, `nextPage`, `priorPage`.
- Controllers must not return domain entities directly.

## Pagination

All list endpoints use the same parameters:
- `currentPage` (default 1)
- `pageSize` (default 12, max 50)
- `orderBy` (validated against allowed fields)
- `orderDir` (asc/desc)
- `search` (optional, case-insensitive partial match)

Never use client-provided values directly for SQL. Validate `orderBy` against allowed fields.

## Search

- Use `Contains()` for text search. Rely on database case-insensitive collation.
- Do NOT use `ToUpper()` or `ToLower()` on columns. It prevents index usage.
- Empty search parameters must be treated as absent. No filter applied when null or empty.

## Dates

All dates in UTC everywhere. Backend receives, processes, stores, and returns UTC. Frontend converts to local time for display.

Explicit UTC validation on input dates. Reject dates without `DateTimeKind.Utc`. No silent conversion via `.ToUniversalTime()`. No timezone conversion in controllers or services for presentation.

## Private fields

camelCase. No PascalCase for private fields.

```csharp
private long id;
private string name;
private DateTime createdAt;
```

## Public members

PascalCase for properties, methods, classes, interfaces.

## Identifiers

- `long`, positive, auto-incremental, required.
- Database-generated. No GUIDs for main entities.
- 0 means not persisted. No negative IDs. No special values like -1, -99.
- No IDs as business logic. No `if (publisherId == 1)`.

## DTOs

- API contracts use DTOs. Never return persistence entities or domain entities from controllers.
- DTOs defined in Application or Api layer.
- Domain does not know DTOs. DTOs do not know domain.

## Mappers

- Mapping between domain entities and DTOs happens in Application or Infrastructure, never in repositories.
- Repositories return domain entities. Mapping to DTOs happens in upper layers.
- Use static mappers or dedicated classes. No manual mapping in controllers.
- Inline URL construction (`$"/images/{image.Id}"`) is forbidden. Use `ImageUrlBuilder.ToUrl(image)`.

## Layer rules

- Application Services orchestrate use cases. They can call repositories, technical services, UnitOfWork, execute rules, persist changes, map to DTOs.
- Repositories perform CRUD only. No `SaveChanges`, no transactions, no business rules, no token generation, no JWT, no DTO mapping.
- Infrastructure Services implement technical capabilities: crypto, hashing, email, file storage, JWT generation. They must not orchestrate use cases or hide Application behavior.
- Domain contains entities, value objects, rules, invariants, exceptions. No ASP.NET Core, EF Core, MySQL, HTTP, Infrastructure.
- **Application must not reference infrastructure-only NuGet packages.** The audit found `Hangfire.AspNetCore` lingering in `Application.csproj`. Check `Application.csproj` and `Infrastructure.csproj` for symmetry: any package in Application must be used by Application code; any package used only by Infrastructure must live in Infrastructure.

## Service boundaries
