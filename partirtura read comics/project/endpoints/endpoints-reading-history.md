# Endpoints â€” Reading History

Controller covered:
- ReadingHistoryController â€” Reading history of the authenticated user (US-0031, Mi colecciÃ³n)

## GET /api/users/me/reading-history

Description:
Returns the paginated reading history of the **authenticated user**, built from `WorkReadingProgress`.
Only works with reading progress for that user are returned, and only works that are currently active
(inactive works are excluded by the visibility rules of the catalog). Each item reuses the exact
contract of the catalog `WorkCard`, including `myReadingProgress`, so the Public Web can render the
same components as `GET /api/works` without transformations.

Controller:
ReadingHistoryController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The user is identified from the JWT `sub` claim. The endpoint never accepts a `UserId` parameter,
  query or body: a `userId` sent by the client is ignored.
- Anonymous access is not allowed (401).

Request parameters (query string):
- currentPage: integer (default 1; values below 1 are normalized to 1)
- pageSize: integer (default 12; values below 1 are normalized to 12; maximum 50)
- state: string (optional, case-insensitive). Allowed values:
  - `reading` â†’ only works whose progress state is `Reading`.
  - `completed` â†’ only works whose progress state is `Completed`.
  - `all` â†’ the complete history (`Reading` + `Completed`), no filter.
  - absent / empty / `null` â†’ same as `all`.
  - **any other value** (for example `foo`) â†’ **treated as `all`**: the complete history is returned,
    no error is raised. This is the documented fallback and is intentionally identical to `all`
    so the frontend never has to validate the value before calling.

Behavior:
- The history contains only the works the authenticated user is reading or has already completed.
  It is never the full catalog: "all" means all of the user's history entries, not every work.
- Results are ordered by `LastReadAt` descending (most recent activity first), with `Id` as a
  deterministic tie-breaker so pagination is stable.
- Filtering, ordering and pagination are executed in the database before materialization. The works
  of the whole page are resolved in a single query (no per-work queries).
- `myReadingProgress` is never `null` in this endpoint: every item has progress by definition.
- `averageRating` is the average of the active ratings of the Work (zero-star votes included), or
  `null` when the Work has no active ratings. It comes from the `Work` accumulators maintained by
  `WorkRatingService`, so the listing adds no extra query.
- `percentage` is the value persisted by `PUT /api/works/{id}/progress` (`PercentageReading`),
  following the rule `(currentPage - 1) * 100 / totalPages`, and 0 when the work has no pages.
  A completed work with pages reports 100.
- The endpoint never creates or modifies reading progress.
- Pagination metadata (`totalCount`, `totalPages`, `hasNextPage`, `hasPriorPage`, `nextPage`,
  `priorPage`) is computed over the filtered set, before pagination.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "currentPage": 1,
          "hasNextPage": true,
          "hasPriorPage": false,
          "totalPages": 5,
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 58,
          "items": [
              {
                  "id": 101,
                  "workTypeId": 1,
                  "workTypeName": "Number",
                  "title": "X-Men #1",
                  "description": "First appearance of the X-Men...",
                  "numberValue": "1",
                  "publicationDate": "1963-09-01T00:00:00Z",
                  "createdAt": "2026-01-10T15:30:00Z",
                  "coverId": 200,
                  "urlCover": "/images/200",
                  "series": { "id": 11, "name": "Uncanny X-Men", "color": "#1B3A6B" },
                  "franchise": { "id": 4, "name": "X-Men", "color": "#F5C518" },
                  "publisher": { "id": 2, "name": "Marvel Comics", "color": "#EC1D24" },
                  "myReadingProgress": {
                      "averageRating": 4.5,
                      "currentPage": 12,
                      "totalPages": 32,
                      "percentage": 34,
                      "status": "Reading",
                      "lastReadAt": "2026-10-09T14:22:10Z"
                  }
              },
              {
                  "id": 102,
                  "workTypeId": 1,
                  "workTypeName": "Number",
                  "title": "X-Men #2",
                  "description": null,
                  "numberValue": "2",
                  "publicationDate": "1963-10-01T00:00:00Z",
                  "createdAt": "2026-01-11T15:30:00Z",
                  "coverId": null,
                  "urlCover": null,
                  "series": null,
                  "franchise": null,
                  "publisher": null,
                  "myReadingProgress": {
                      "currentPage": 33,
                      "totalPages": 32,
                      "percentage": 100,
                      "status": "Completed",
                      "lastReadAt": "2026-10-08T09:10:00Z"
                  },
                  "averageRating": null
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Response Type:
`ApiResponse<ListResponse<WorkCatalogItemDto>>`

DTO:
`Application/DTOs/WorkCatalogDtos.cs` â€” `WorkCatalogItemDto`, identical to the catalog item
(`GET /api/works`): Id, WorkTypeId, WorkTypeName, Title, Description, NumberValue, PublicationDate,
CreatedAt, CoverId, UrlCover, Series/Franchise/Publisher as `WorkCatalogNodeDto` (Id, Name, Color),
MyReadingProgress as `ReaderMyProgressDto` (CurrentPage, TotalPages, Percentage, Status, LastReadAt) and AverageRating.
Request: `Application/DTOs/WorkContentDtos.cs` â€” `GetReadingHistoryRequest` (currentPage, pageSize, state).

Errors:
- 401 Unauthorized

Notes:
- Reuses the catalog contract on purpose: the same `WorkCard` component and the same client-side
  mapping render this list, so no screen-specific transformation is needed.
- There are no separate endpoints for `Reading` and `Completed`: the single `state` filter covers both.
- Read-only. No side effects.
