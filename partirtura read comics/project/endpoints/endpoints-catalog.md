# Endpoints

Controllers covered:
- CatalogController — Public Web card listings (US-0026, US-0027)

Added 2026-10 for US-0026. These three endpoints feed the Public Web explore pages
(`/publishers`, `/franchises`, `/series`). They are **not** a replacement for
`GET /api/publishers`, `GET /api/franchises` or `GET /api/series`, which stay as the filter
contract consumed by the `GET /api/works` autocomplete. See
`endpoints-publishers.md`, `endpoints-franchises.md` and `endpoints-series.md`.

Added 2026-10 for US-0027. These two endpoints feed the Public Web lists pages
(`/lists` and `/lists/{id}`). They expose only official active lists (`OwnerType = System`,
`IsActive = true`).

## GET /api/catalog/publishers

Description:
Returns the paginated list of publishers used to render the publisher cards of the Public Web
explore page. Never returns inactive publishers.

Controller:
CatalogController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- Anonymous access is not allowed (`[Authorize]`, no `[AllowAnonymous]`).

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 24, max 36)
- search: string (optional, partial case-insensitive match on the publisher name only)

No `orderBy` and no `orderDir`: the ordering is a rule of this use case and is always
`Name ASC`. Unknown query parameters are ignored by model binding, so a client that still sends
them gets the fixed ordering instead of an error.

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
          "totalPages": 3,
          "pageSize": 24,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 61,
          "items": [
              {
                  "id": 2,
                  "name": "Marvel Comics",
                  "color": "#EC1D24",
                  "urlImage": "/images/123"
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Response Type:
`ApiResponse<ListResponse<CatalogPublisherCardDto>>`

DTO:
`Application/DTOs/CatalogCardDtos.cs` — `CatalogPublisherCardDto` (Id, Name, Color, UrlImage).

Notes:
- `urlImage` is `null` when the publisher has no logo. It is a relative path built with
  `ImageUrlBuilder.ToUrl`, the same mechanism the rest of the API uses.
- `color` is `null` when the publisher has no color; the Public Web applies its own default.
- Administrative data is never exposed: no `isActive`, `isFeatured`, `isAlive`, `createdAt`,
  `countryName`, `imageId` or storage information.
- Read-only. No side effects.

## GET /api/catalog/franchises

Description:
Returns the paginated list of franchises used to render the franchise cards of the Public Web
explore page. Only franchises that are active **and** whose publisher is active are returned, so
a card never points at a deactivated publisher pill.

Controller:
CatalogController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- Anonymous access is not allowed.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 24, max 36)
- search: string (optional, partial case-insensitive match on the franchise name **or** the
  publisher name, combined with `OR`)
- publisherId: long (optional, filters franchises that belong to the given publisher)

No `orderBy` and no `orderDir`; the ordering is always `Franchise.Name ASC`.

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
          "totalPages": 2,
          "pageSize": 24,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 37,
          "items": [
              {
                  "id": 7,
                  "name": "Deadpool",
                  "color": "#C8102E",
                  "urlImage": "/images/130",
                  "publisher": {
                      "id": 2,
                      "name": "Marvel Comics",
                      "color": "#EC1D24"
                  }
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Response Type:
`ApiResponse<ListResponse<CatalogFranchiseCardDto>>`

DTO:
`Application/DTOs/CatalogCardDtos.cs` — `CatalogFranchiseCardDto` (Id, Name, Color, UrlImage,
Publisher) with `Publisher` of type `CatalogNodeDto` (Id, Name, Color).

Notes:
- `publisher` is always present: `Franchise.PublisherId` is a required foreign key and the
  repository filters inactive publishers out in SQL, so the card always has the publisher id,
  name and color needed for the pill and for navigation to `/publishers/{id}`.
- The optional `publisherId` filter restricts the result to franchises whose publisher matches
  the given id. It combines with `search` using `AND`, is applied in the database before
  pagination, and affects `totalCount`, `totalPages` and `hasNextPage`. Hierarchy navigation is
  otherwise handled by the franchise and series detail pages.
- Administrative data is never exposed: no `isActive`, `isFeatured`, `isOngoing`, `createdAt`,
  `countryName` or storage information.
- Read-only. No side effects.

## GET /api/catalog/series

Description:
Returns the paginated list of series used to render the series cards of the Public Web explore
page. Only series that are active **and** whose franchise and publisher are active are returned,
so a card never points at a deactivated franchise or publisher pill.

Controller:
CatalogController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- Anonymous access is not allowed.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 24, max 36)
- search: string (optional, partial case-insensitive match on the series name, the franchise name
  or the publisher name, combined with `OR`)
- franchiseId: long (optional, filters series that belong to the given franchise)
- publisherId: long (optional, filters series that belong to the given publisher)

No `orderBy` and no `orderDir`; the ordering is always `Series.Name ASC`.

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
          "totalPages": 4,
          "pageSize": 24,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 84,
          "items": [
              {
                  "id": 11,
                  "name": "Uncanny X-Men",
                  "color": "#1B3A6B",
                  "urlImage": "/images/140",
                  "franchise": {
                      "id": 4,
                      "name": "X-Men",
                      "color": "#F5C518"
                  },
                  "publisher": {
                      "id": 2,
                      "name": "Marvel Comics",
                      "color": "#EC1D24"
                  }
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Response Type:
`ApiResponse<ListResponse<CatalogSeriesCardDto>>`

DTO:
`Application/DTOs/CatalogCardDtos.cs` — `CatalogSeriesCardDto` (Id, Name, Color, UrlImage,
Franchise, Publisher) with both nodes of type `CatalogNodeDto` (Id, Name, Color).

Notes:
- `franchise` and `publisher` are always present: both are required foreign keys and the
  repository filters inactive parents out in SQL, so the card always has the ids, names and
  colors needed for both pills and for navigation.
- The optional `franchiseId` and `publisherId` filters restrict the result to series belonging
  to the given franchise and/or publisher. They combine with each other and with `search` using
  `AND`, are applied in the database before pagination, and affect `totalCount`, `totalPages`
  and `hasNextPage`.
- Administrative data is never exposed: no `isActive`, `isFeatured`, `isOngoing`, `createdAt`,
  `description` or storage information.
- Read-only. No side effects.

---

## Shared behavior

- **Response wrapper**: every response is `ApiResponse<ListResponse<T>>`. Pagination fields are
  built with `PaginationGuard.Build`, so `hasNextPage`, `nextPage`, `totalPages` and `totalCount`
  behave exactly like the rest of the paginated API and support infinite scroll.
- **Paging**: `currentPage < 1` becomes `1`, `pageSize < 1` becomes `24` and `pageSize > 36`
  becomes `36` (`PaginationGuard.CatalogCardDefaultPageSize` / `CatalogCardMaxPageSize`, both
  multiples of 12 so a card grid fills evenly). Invalid values are normalized, never rejected.
- **Ordering**: fixed `Name ASC` with an `Id` tie-breaker, so paging never repeats or drops an
  item across pages.
- **No rate limiting**: these are read-only catalog listings, same as the existing public list
  endpoints. They carry no `[EnableRateLimiting]` policy.

---

## GET /api/catalog/lists

Description:
Returns the paginated list of official lists used to render the list cards of the Public Web
explore page (`/lists`). Only lists that are active **and** owned by System (`OwnerType = System`)
are returned, unless the `myLists` parameter asks for the personal lists of the authenticated user.

Controller:
CatalogController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- Anonymous access is not allowed.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 24, max 36)
- search: string (optional, partial case-insensitive match on the list name **or** description, combined with `OR`)
- publisherId: long (optional, filters lists that contain at least one work from the given publisher, including via franchise and series)
- franchiseId: long (optional, filters lists that contain at least one work from the given franchise, including via series)
- seriesId: long (optional, filters lists that contain at least one work from the given series)
- listTypeId: long (optional, filters lists by their list type)
- orderBy: string (optional, `name` or `createdat`; default `createdat`)
- orderDir: string (optional, `ASC` or `DESC`; default `DESC`)
- myLists: string (optional, US-0036). Only the literal value `true` returns the personal lists of the
  authenticated user; any other value (`false`, omitted, empty or not recognized) keeps returning the
  system lists, without producing a conversion error. Personal and system lists are never mixed in the
  same response. The filter is applied in the database before counting and paginating, so `totalCount`,
  `totalPages` and `hasNextPage` describe the filtered set.

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
          "totalPages": 3,
          "pageSize": 24,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 61,
          "items": [
              {
                  "id": 5,
                  "name": "Orden de lectura X-Men",
                  "listTypeId": 2,
                  "listTypeName": "CronolÃ³gica",
                  "color": "#1B3A6B",
                  "urlCover": "/images/123",
                  "workCount": 15,
                  "readingProgressPercentage": 20,
                  "averageRating": 4.5,
                  "ratingCount": 8
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Response Type:
`ApiResponse<ListResponse<CatalogListCardDto>>`

DTO:
`Application/DTOs/CatalogListDtos.cs` â€” `CatalogListCardDto` (Id, Name, ListTypeId, ListTypeName, Color, UrlCover, WorkCount, ReadingProgressPercentage, AverageRating, RatingCount).

Notes:
- `urlCover` is `null` when the list has no cover image. It is a relative path built with `ImageUrlBuilder.ToUrl`.
- `color` is `null` when the list has no color; the Public Web applies its own default.
- Hierarchical filters (`publisherId`, `franchiseId`, `seriesId`) combine with `AND`. A list matches a publisher when it contains at least one work belonging to that publisher (directly, or via franchise, or via series). A list matches a franchise when it contains at least one work belonging to that franchise (directly, or via series). A list matches a series when it contains at least one work belonging to that series.
- `search` combines with filters using `AND`.
- `orderBy` accepts `name` or `createdat`. Unknown values fall back to `createdat`.
- Default ordering is `CreatedAt DESC` (newest lists first).
- Pagination uses `PaginationGuard.CatalogCardDefaultPageSize` (24) and `CatalogCardMaxPageSize` (36).
- Administrative data is never exposed: no `isActive`, `ownerType`, `ownerUserId`, `visibility`, `createdAt`, or storage information.
- Read-only. No side effects.
- `readingProgressPercentage` (US-0034, authenticated reader): the percentage of works of the list the current user has completed, computed in SQL as `completedWorks * 100 / totalWorks` using `ReadingState.Completed`. An empty list returns `0`; when the user has no reading progress for any work of the list it is `null`. `null` is also returned when the `sub` claim is missing or cannot be parsed.
- `averageRating` / `ratingCount` (US-0034): the accumulators persisted on `WorkList`. When `ratingCount` is `0`, `averageRating` is `null`. Individual ratings are never queried to recompute them.

## GET /api/catalog/lists/{id}

Description:
Returns the detail of an official list, including its works in the order defined by the list
(`WorkListItem.Position`). Used by the Public Web list detail page (`/lists/{id}`).

Since US-0036 the same endpoint also returns the detail of a **personal list** when it belongs to the
authenticated user, so the Public Web reuses the same list detail page for both kinds of list. A personal
list has no list type, so `listTypeId` and `listTypeName` are `null`, and it is never rated, so
`averageRating` is `null` and `ratingCount` is `0`.

Controller:
CatalogController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- Anonymous access is not allowed.

Request parameters:
- id: long (path parameter, required)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "id": 5,
          "name": "Orden de lectura X-Men",
          "listTypeId": 2,
          "listTypeName": "Cronológica",
          "description": "Orden recomendado para leer la saga X-Men...",
          "color": "#1B3A6B",
          "urlCover": "/images/123",
          "workCount": 15,
          "readingProgressPercentage": 20,
          "averageRating": 4.5,
          "ratingCount": 8,
          "works": [
              {
                  "position": 1,
                  "work": {
                      "id": 101,
                      "title": "X-Men #1",
                      "description": "First appearance of the X-Men...",
                      "publisherId": 2,
                      "publisherName": "Marvel Comics",
                      "publisherColor": "#EC1D24",
                      "franchiseId": 4,
                      "franchiseName": "X-Men",
                      "franchiseColor": "#F5C518",
                      "seriesId": 11,
                      "seriesName": "Uncanny X-Men",
                      "seriesColor": "#1B3A6B",
                      "publicationDate": "1963-09-01T00:00:00Z",
                      "urlCover": "/images/200",
                      "workTypeId": 1,
                      "workTypeName": "Número",
                      "numberValue": "1",
                      "createdAt": "2024-01-15T10:30:00Z",
                      "readingProgressPercentage": 40
                  }
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist or is inactive.

Response Type:
`ApiResponse<CatalogListDetailDto>`

DTO:
`Application/DTOs/CatalogListDtos.cs` â€” `CatalogListDetailDto` (Id, Name, ListTypeId, ListTypeName, Description, Color, UrlCover, WorkCount, ReadingProgressPercentage, AverageRating, RatingCount, Works) with `Works` as `IReadOnlyList<CatalogListWorkItemDto>` (Position, Work). `CatalogListWorkDto` exposes all fields needed to render the existing WorkCard: Id, Title, Description, Publisher (Id, Name, Color), Franchise (Id, Name, Color), Series (Id, Name, Color), PublicationDate, UrlCover, WorkType (Id, Name), NumberValue, CreatedAt, ReadingProgressPercentage. Since US-0036, `ListTypeId` and `ListTypeName` are nullable (a personal list has no list type).

Notes:
- Works are returned ordered by `WorkListItem.Position` (the order defined by the list). No client-side sorting or filtering is applied.
- The endpoint loads the full work graph needed for WorkCard in a single query with `AsSplitQuery`: Work, WorkType, Series.Franchise.Publisher, Franchise.Publisher, Publisher, and Work.Cover.
- No N+1 queries: all relationships required for WorkCard are eager-loaded.
- Colors are populated from the entity color, resolving the parent chain when the work does not have the level directly: PublisherColor comes from Work.Publisher â†’ Work.Franchise?.Publisher â†’ Work.Series?.Franchise?.Publisher; FranchiseColor from Work.Franchise â†’ Work.Series?.Franchise; SeriesColor from Work.Series.
- If the list exists but is inactive or not owned by System, returns 404 (same message as non-existent, so existence of a deactivated list is not disclosed).
- Since US-0036, a personal list is also returned when it belongs to the authenticated user; for a personal list of another user the response is 404. A personal list exposes `listTypeId: null` and `listTypeName: null`, and it is never rated (`averageRating: null`, `ratingCount: 0`).
- Administrative data is never exposed: no `ownerType`, `ownerUserId`, `visibility`, `isActive`, `createdAt`.
- Read-only. No side effects.
- List-level `readingProgressPercentage` (US-0034, authenticated reader): `completedWorks * 100 / totalWorks` using `ReadingState.Completed`. An empty list returns `0`; when the user has no reading progress for any work of the list it is `null`.
- List-level `averageRating` / `ratingCount` (US-0034): accumulators persisted on `WorkList`. When `ratingCount` is `0`, `averageRating` is `null`.
- Per-work `readingProgressPercentage` (US-0034, authenticated reader): the stored `WorkReadingProgress.PercentageReading` of the current user for that work, or `null` when the user has no progress record for it. The list and per-work progress are read through a single batched query (`IWorkReadingProgressRepository.GetByWorkIdsAndUserIdAsync`), never one query per work.

---

## Shared behavior