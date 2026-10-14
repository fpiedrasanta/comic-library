# Endpoints

API endpoint index. Detailed per-endpoint documentation lives in the per-controller files under `project/endpoints/`. This index is the source of truth for which file to open.

## Conventions

### HTTP status codes

Per the backend rules, every endpoint must return the semantically correct status code:

- `200 OK` — read or update that did not create a resource.
- `201 Created` — POST that creates a resource. The response must include a `Location` header set via `CreatedAtAction(nameof(Get), new { id }, ApiResponse<T>...)`.
- `204 No Content` — not currently used (we always return the resource).
- `400 Bad Request` — malformed request (e.g. invalid JSON, missing required path parameter).
- `401 Unauthorized` — missing or invalid bearer token / refresh token.
- `403 Forbidden` — authenticated but missing the required role.
- `404 Not Found` — `BusinessNotFoundException` (entity does not exist or is `IsActive = false`).
- `409 Conflict` — `BusinessConflictException` (duplicate, invalid state transition).
- `422 Unprocessable Entity` — `ValidationException` and `BusinessException` (input is syntactically valid but semantically rejected).
- `429 Too Many Requests` — `RateLimitExceededException` (returned by the rate limiter).
- `500 Internal Server Error` — unexpected exception.

### Rate limiting

Sensitive endpoints must be annotated with `[EnableRateLimiting(RateLimitPolicies.X)]`. The mapping is in `backend-coding-rules.md`. When a new sensitive endpoint is added, a new policy must be added in `RateLimiterConfiguration.cs` and documented in the rules.

### Response wrapper

All responses are `ApiResponse<T>`. Paginated lists use `ApiResponse<ListResponse<TDto>>`.

## Per-controller endpoint docs

| Path prefix | File |
| --- | --- |
| `/api/countries`, `/api/admin-countries` | `endpoints/endpoints-countries.md` |
| `/api/admin-publishers`, `/api/publishers` | `endpoints/endpoints-publishers.md` |
| `/api/users` (auth) | `endpoints/endpoints-users-auth.md` |
| `/api/users` (recovery) | `endpoints/endpoints-users-recovery.md` |
| `/api/users` (profile) | `endpoints/endpoints-users-profile.md` |
| `/api/users` (account) | `endpoints/endpoints-users-account.md` |
| `/api/users` (admin) | `endpoints/endpoints-users-admin.md` |
| `/api/bans` | `endpoints/endpoints-bans.md` |
| `/api/images` | `endpoints/endpoints-images.md` |
| `/api/admin-users` | `endpoints/endpoints-admin-users.md` |
| `/api/admin-franchises`, `/api/franchises` | `endpoints/endpoints-franchises.md` |
| `/api/admin-series`, `/api/series` | `endpoints/endpoints-series.md` |
| `/api/admin-persons` | `endpoints/endpoints-persons.md` |
| `/api/admin-roles` | `endpoints/endpoints-roles.md` |
| `/api/admin-languages` | `endpoints/endpoints-languages.md` |
| `/api/admin-tags` | `endpoints/endpoints-tags.md` |
| `/api/admin-list-types` | `endpoints/endpoints-list-types.md` |
| `/api/admin-work-types`, `/api/work-types` | `endpoints/endpoints-work-types.md` |
| `/api/admin-work-lists` | `endpoints/endpoints-work-lists.md` |
| `/api/admin-works`, `/api/works` | `endpoints/endpoints-works.md` |
| `/api/works/recommended` | `endpoints/endpoints-recommended-works.md` |
| `/api/works/{workId}/ratings` | `endpoints/endpoints-work-ratings.md` |
| `/api/users/me/reading-history` | `endpoints/endpoints-reading-history.md` |
| `/api/catalog` | `endpoints/endpoints-catalog.md` |

Each per-controller file documents:

- Description
- Controller
- Authentication (where applicable)
- Request parameters / body
- Response (status code, body, response type)
- Errors (per status code)
- Notes (caller-visible behavior, ordering, side effects)

## Rate-limit matrix (mirrors the policies in `RateLimitPolicies.cs`)

| Endpoint | Policy |
| --- | --- |
| `POST /api/users/register` | `AuthRegister` (5/h by IP) |
| `POST /api/users/resend-validation-email` | `AuthResendCode` (3/h by IP) |
| `POST /api/users/google-login` | `AuthGoogleLogin` (10/15min by IP) |
| `POST /api/users/login` | `AuthLogin` (10/15min by IP) |
| `POST /api/users/refresh-token` | `AuthRefresh` (30/min by IP) |
| `POST /api/users/forgot-password` | `AuthForgotPassword` (5/h by IP) |
| `POST /api/users/resend-password-reset-code` | `AuthResendCode` (3/h by IP) |
| `POST /api/users/account-deletion/request` | `AuthAccountDeletion` (5/h by user) |
| `POST /api/users/account-deletion/confirm` | `AuthAccountDeletion` (5/h by user) |
| `POST /api/admin-works/{workId}/ai-analysis` | `AdminAiAnalysis` (10/h by user) |
| `POST /api/admin-list-types` | `AdminListTypeCreate` (5/h by user) |
| `POST /api/admin-works` | `AdminWorkCreate` (5/h by user) |

## Open follow-up (from 2026-09 audit)

1. **Migrate the remaining admin POSTs to `CreatedAtAction` so they return 201 Created.** Completed for `POST /api/admin-roles` (TASK-API-0207). The affected endpoints are documented in their per-controller files.
2. **Add controller-level tests** for the new status codes and rate limiting behavior. Today the suite covers services and helpers; controller integration tests (using `WebApplicationFactory`) are not yet in place. This is a `FASE 8` item in `refactor-audit-2026-09-03.md`.
