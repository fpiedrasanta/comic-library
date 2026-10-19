# Endpoints â€” Recommended Works

Controller covered:
- RecommendedWorksController â€” Catalog recommendations for the authenticated user (US-0033)

## GET /api/works/recommended

Description:
Returns up to 12 works the authenticated user has not started reading yet, ordered by the requested
criterion. Selection, metrics and ordering are resolved in the database in a single query; the client
never receives the catalog to filter it.

Controller:
RecommendedWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The user is identified from the JWT `sub` claim. A `userId` sent by the client is ignored.
- Anonymous access is not allowed (401).

Request parameters (query string):
- sortBy: string (optional, case-insensitive). Allowed values:
  - `MostPopular` (default) â€” weighted reading popularity.
  - `RecentlyAdded` â€” most recently added works.
  - `MostRated` â€” best rated works.
  - Any other or empty value when omitted â†’ treated as `MostPopular`.
  - **A value that is not one of the three is rejected with 422** (`ValidationException`). Empty or
    whitespace-only means "not specified" and resolves to `MostPopular`.
- There is no pagination: the endpoint always returns at most 12 results.

Selection rules:
- Only active works are eligible (the visibility rules of the catalog apply).
- Works the authenticated user already started are excluded: the user has reading progress for the
  work, whatever its value. This covers a work opened at page 1 (0 % progress) and a completed work.
- Progress of other users does not exclude a work: another reader's activity makes the work
  recommended for this user.
- Works without completions, without progress or without ratings are eligible and can fill the results.

Ordering:
- `MostPopular`: weighted reading progress `SUM(PercentageReading)` over the progress rows of the work,
  descending; ties by `CreatedAt` descending, then `Id` descending. A work with many readers at a high
  percentage ranks above a work with a single completed reader, and works with no reading activity
  (sum 0) rank last, ordered by `CreatedAt` descending between them.
- `RecentlyAdded`: `CreatedAt` descending, then `Id` descending.
- `MostRated`: works with at least one active rating first, then `AverageRating` (average of
  `WorkRating.Stars` over active ratings, zero-star votes included) descending, ties by `CreatedAt`
  descending, then `Id` descending. Works without ratings appear after the rated ones.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": [
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
              "myReadingProgress": null,
              "averageRating": 4.5
          }
      ]
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 422 ValidationException when `sortBy` is not one of the allowed criteria.

Response Type:
`ApiResponse<IReadOnlyList<WorkCatalogItemDto>>`

DTO:
`Application/DTOs/WorkCatalogDtos.cs` â€” the same `WorkCatalogItemDto` used by `GET /api/works`, so the
Public Web renders these results with the existing `WorkCard` component and mapping: Id, WorkTypeId,
WorkTypeName, Title, Description, NumberValue, PublicationDate, CreatedAt, CoverId, UrlCover,
Series/Franchise/Publisher as `WorkCatalogNodeDto` (Id, Name, Color), MyReadingProgress as
`ReaderMyProgressDto` (always `null` here, since recommended works have no progress for the user) and
AverageRating.

Errors:
- 401 Unauthorized
- 422 ValidationException (invalid `sortBy`)

Notes:
- `myReadingProgress` is always `null` in this endpoint: a recommended work is by definition one the
  user has not started. The field is kept so the response can be mapped with the same code as the
  catalog.
- `averageRating` is the average of the active ratings of the Work (zero-star votes included), or
  `null` when the Work has no active ratings. It comes from the `Work` accumulators maintained by
  `WorkRatingService`, so the listing adds no extra query and the value matches the detail. It lets the
  card show `★★★★½ 4,5` without a per-work request.
- `isFavorite` is the favorite state of the Work for the authenticated user (US-0035). It is resolved with
  a single batched query for the whole list, never one query per work. The attribute is exclusively part of
  the response: the request parameters are unchanged.
- The metrics (`SUM(PercentageReading)`, `AVG(Stars)`) are computed in the database through correlated
  subqueries in the `ORDER BY`; no work is loaded to compute them in memory.
- Read-only. No side effects.
