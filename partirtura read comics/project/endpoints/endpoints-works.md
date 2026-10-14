# Endpoints

Controllers covered:
- AdminWorksController â€” Unified CRUD for all Works (Numbers, Graphic Novels, and any WorkType)
- WorksController â€” Public catalog browsing for authenticated readers

## GET /api/works

Description:
Returns a paginated list of the active works available in the public catalog, for registered readers. Used by catalog browsing and infinite scroll. It is a read-only projection: administrative data (IsActive, ContentStatus, IA state) is never returned.

Controller:
WorksController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- search: string (optional, partial case-insensitive match on Title, Description, NumberValue, Tags and Person â€” Person matches regardless of Role)
- publisherId: long (optional, hierarchical filter â€” works of the publisher, of its franchises and of the series of those franchises)
- franchiseId: long (optional, hierarchical filter â€” works of the franchise and works of the series of that franchise)
- seriesId: long (optional, filter by series)
- workTypeId: long (optional, filter by WorkType; never used to resolve hierarchy membership)
- orderBy: string (optional, allowed: Title, PublicationDate, CreatedAt, UploadedAt (alias of CreatedAt), Number)
- orderDir: string (default DESC)

Behavior:
- Several filters combine with AND; the hierarchy never returns works outside the selected context.
- Filtering, search, ordering and pagination are executed in the database before materialization.
- Default ordering is `CreatedAt DESC` (most recent first), with `Id` as tie-breaker for stable pagination.
- The `Series`, `Franchise` and `Publisher` nodes returned are the effective ones: a work assigned to a Series also reports the Franchise and Publisher of that Series.
- `myReadingProgress` is the reading progress of the **authenticated user** for each work (identity from the JWT `sub` claim; the client cannot indicate a `UserId`). It is `null` when the user has no progress for that work. The progresses of the whole page are fetched with a single batch query, never one query per work, and only when the user is authenticated and the page has items.
- Percentage, currentPage, totalPages, lastReadAt and status are the values persisted by `PUT /api/works/{id}/progress`; the list does not recalculate them.

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
          "totalCount": 60,
          "items": [
              {
                  "id": 1,
                  "workTypeId": 1,
                  "workTypeName": "Number",
                  "title": "Batman #1",
                  "description": "First appearance of Batman.",
                  "numberValue": "1",
                  "publicationDate": "1940-04-25T00:00:00Z",
                  "createdAt": "2026-01-10T15:30:00Z",
                  "coverId": 100,
                  "urlCover": "/images/100",
                  "series": {
                      "id": 7,
                      "name": "Batman",
                      "color": "#2C3E50"
                  },
                  "franchise": {
                      "id": 3,
                      "name": "Batman",
                      "color": "#34495E"
                  },
                   "publisher": {
                       "id": 2,
                       "name": "DC Comics",
                       "color": "#1F2D3D"
                   },
                   "myReadingProgress": {
                       "currentPage": 12,
                       "totalPages": 32,
                       "percentage": 34,
                       "status": "Reading",
                       "lastReadAt": "2026-10-09T14:22:10Z"
                   },
                   "averageRating": 4.5
               },
               {
                   "id": 2,
                   "workTypeId": 1,
                   "workTypeName": "Number",
                   "title": "Batman #2",
                   "description": null,
                   "numberValue": "2",
                   "publicationDate": "1940-05-25T00:00:00Z",
                   "createdAt": "2026-01-11T15:30:00Z",
                   "coverId": null,
                   "urlCover": null,
                   "series": null,
                   "franchise": null,
                   "publisher": null,
                   "myReadingProgress": null,
                   "averageRating": 4.5
               }
           ]
       }
   }
- 401 Unauthorized when the bearer token is missing or invalid.

DTO:
`Application/DTOs/WorkCatalogDtos.cs` â€” `GetCatalogWorksRequest`, `WorkCatalogItemDto` (Id, WorkTypeId, WorkTypeName, Title, Description, NumberValue, PublicationDate, CreatedAt, CoverId, UrlCover, Series/Franchise/Publisher as `WorkCatalogNodeDto`, MyReadingProgress as `ReaderMyProgressDto`: CurrentPage, TotalPages, Percentage, LastReadAt, Status; AverageRating), `WorkCatalogNodeDto`.

Notes:
- `averageRating` is the average of the active ratings of the Work (zero-star votes included), or `null` when the Work has no active ratings. It comes from the `Work` accumulators (`RatingCount` / `AverageRating`) maintained by `WorkRatingService`, the same values used by the detail, so the listing adds no extra query. A card must check for `null` before showing the rating.

## GET /api/works/{id}

Description:
Returns the full public detail of a work, including its editorial context, cover, number, title,
description, language, work type, publication date, previous/next works in the explicit sequence,
person assignments, and tags. Used by the Public Web work detail page (`/works/{id}`).
For authenticated users it also returns that user's reading progress for the work (`myReadingProgress`),
so the detail page can show the progress bar and choose the main action (Leer / Continuar / Recomenzar).

Controller:
WorksController

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
          "id": 101,
          "publisher": { "id": 2, "name": "Marvel Comics", "color": "#EC1D24", "urlCover": "/images/2" },
          "franchise": { "id": 4, "name": "X-Men", "color": "#F5C518", "urlCover": "/images/4" },
          "series": { "id": 11, "name": "Uncanny X-Men", "color": "#1B3A6B", "urlCover": "/images/11" },
          "urlCover": "/images/200",
          "numberValue": "1",
          "title": "X-Men #1",
          "description": "First appearance of the X-Men...",
          "language": { "id": 1, "name": "English", "code": "en" },
          "workType": { "id": 1, "name": "NÃºmero" },
          "publicationDate": "1963-09-01T00:00:00Z",
          "previousWork": { "id": 99, "title": "X-Men #0", "numberValue": "0", "urlCover": "/images/99" },
          "nextWork": { "id": 102, "title": "X-Men #2", "numberValue": "2", "urlCover": "/images/102" },
          "personAssignments": [
              { "personId": 1, "personName": "Stan Lee", "roleId": 1, "roleName": "Writer" },
              { "personId": 2, "personName": "Steve Ditko", "roleId": 2, "roleName": "Penciller" },
              { "personId": 2, "personName": "Steve Ditko", "roleId": 3, "roleName": "Inker" }
          ],
          "tags": [
              { "id": 1, "name": "Superhero" },
              { "id": 2, "name": "Team" }
          ],
          "averageRating": 4.5,
          "ratingCount": 1250,
          "myReadingProgress": {
              "currentPage": 12,
              "totalPages": 32,
              "percentage": 34,
              "lastReadAt": "2026-10-09T14:22:10Z",
              "status": "Reading"
          }
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.

Response Type:
`ApiResponse<CatalogWorkDetailDto>`

DTO:
`Application/DTOs/WorkCatalogDtos.cs` â€” `CatalogWorkDetailDto` (Id, Publisher, Franchise, Series as `CatalogWorkContextDto`: Id, Name, Color, UrlCover; UrlCover; NumberValue; Title; Description; Language as `LanguageDto`; WorkType as `WorkTypeFilterDto`; PublicationDate; PreviousWork/NextWork as `CatalogWorkNavigationDto`: Id, Title, NumberValue, UrlCover; PersonAssignments as `PersonByRoleDto`; Tags as `TagDto`; AverageRating; RatingCount; MyReadingProgress as `ReaderMyProgressDto`: CurrentPage, TotalPages, Percentage, LastReadAt, Status).

Notes:
- Context nodes (Publisher, Franchise, Series) are resolved through the same fallback chain as the catalog: `Work.Publisher` â†’ `Work.Franchise?.Publisher` â†’ `Work.Series?.Franchise?.Publisher`. Only the effective context is returned; the others are `null`.
- PreviousWork and NextWork use only the explicit domain relationships `PreviousNumber` and `NextNumber`. No inference by number, date, or creation order is performed.
- All images are exposed via `ImageUrlBuilder.ToUrl`. Physical storage paths are never exposed.
- Language and WorkType are nullable in the DTO because the domain allows nulls.
- Person assignments are preserved individually; the same person can appear multiple times with different roles.
- Administrative data is never exposed: no `isActive`, `contentStatus`, `iaRequest`, `iaStatus`, `fileId`, `pagesCount`, or storage information.
- `averageRating` and `ratingCount` come from the `Work` accumulators maintained by `WorkRatingService`; the detail never queries the ratings to recalculate them. A Work without votes returns `averageRating = 0` and `ratingCount = 0`. Zero-star votes are included in both values.
- `myReadingProgress` is the reading progress of the **authenticated user only** (identity from the JWT `sub` claim; the client cannot indicate a `UserId`). It is `null` when that user has no progress for the Work. Anonymous requests are rejected with 401 by the controller, so no other user's progress is ever exposed.
- `currentPage`, `totalPages`, `percentage` and `lastReadAt` are the values persisted by `WorkReadingProgress` (`PUT /api/works/{id}/progress`); the detail does not recalculate them. `percentage` follows the existing rule `(currentPage - 1) * 100 / totalPages` (0 when the Work has no pages), so the final position `totalPages + 1` yields 100.
- `status` is `Reading` or `Completed`; `Completed` corresponds to the final position `currentPage = totalPages + 1`.
- The detail is read-only: it never creates or modifies reading progress, and it does not run the extra progress query when there is no authenticated user.
- Public Web uses this object to decide the presentation: `null` â†’ button **Leer** without progress bar; `Reading` â†’ progress bar and **Continuar**; `Completed` â†’ progress bar and **Recomenzar**. **Recomenzar** must not reset the persisted progress; the Reader keeps its current behavior and shows the rating form at the final position.
- Read-only. No side effects.

## GET /api/works/{id}/pages

Description:
Returns the ordered list of pages for a work, intended for the Reader. Each page includes its identity, persisted order, and a protected image URL. Also returns the authenticated user's current reading progress (`currentPage`) if available. Used by the Public Web Reader to display a work page by page and resume reading.

Controller:
WorksController

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
          "workId": 101,
          "previousWork": {
              "id": 100,
              "title": "Mafalda #1",
              "numberValue": "REGULAR - 0001"
          },
          "nextWork": {
              "id": 102,
              "title": "Mafalda #3",
              "numberValue": "REGULAR - 0003"
          },
          "currentPage": 12,
          "myRating": {
              "stars": 4,
              "review": "Excellent issue."
          },
          "pages": [
              {
                  "id": 1001,
                  "number": 1,
                  "url": "/images/2001"
              },
              {
                  "id": 1002,
                  "number": 2,
                  "url": "/images/2002"
              }
          ]
      }
}
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.

Response Type:
`ApiResponse<ReaderWorkPagesDto>`

DTO:
`Application/DTOs/WorkContentDtos.cs` â€” `ReaderWorkPagesDto` (WorkId, PreviousWork as ReaderWorkNavigationDto?, NextWork as ReaderWorkNavigationDto?, CurrentPage as int?, Pages as IReadOnlyList<ReaderPageDto>, MyRating as ReaderMyRatingDto?); `ReaderWorkNavigationDto` (Id, Title, NumberValue); `ReaderPageDto` (Id, Number, Url); `ReaderMyRatingDto` (Stars, Review).

Notes:
- Pages are returned in the persisted `Order` defined by the backend. No client-side sorting is required.
- `previousWork` and `nextWork` come exclusively from the explicit domain relationships `PreviousNumber` and `NextNumber`. No inference by Number, PublicationDate, CreatedAt, or any other criterion is performed.
- `previousWork` and `nextWork` are `null` when the corresponding relationship does not exist.
- `currentPage` is the authenticated user's last read page for this work, or `null` if no progress exists. It is populated from the `WorkReadingProgress` entity.
- `myRating` is the authenticated user's vote for the work (`Stars`, `Review`), populated from `WorkRating`. It is `null` when the user has not voted. It lets the Reader final form (position `TotalPages + 1`) show the existing vote instead of an empty form. A vote is only created or edited through `POST`/`PUT /api/works/{workId}/ratings`.
- `NumberValue` is the raw stored value of the Work. It may be `null` when the Work has no Number. No placeholder or synthetic value is generated.
- Image URLs are built with `ImageUrlBuilder.ToUrl` (`/images/{imageId}`). Physical storage paths, blob internals, and credentials are never exposed.
- An inactive work is treated as unavailable and returns 404, matching the existing availability rule.
- Read-only. No side effects.

## PUT /api/works/{id}/progress

Description:
Updates the authenticated user's reading progress for a work. Creates the progress record if it doesn't exist, or updates the `CurrentPage` if it does. Used by the Reader to persist the last read page when the user navigates.

Controller:
WorksController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim; the request body must not include `userId`.

Rate Limiting:
- Default API rate limits apply.

Request parameters:
- id: long (path parameter, required) â€” the Work ID

Request body:
UpdateReadingProgressRequest (JSON):
{
    "currentPage": 12
}

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Progreso actualizado",
      "code": 200,
      "payload": null
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.
- 422 ValidationException when `currentPage` is negative or the work/user is invalid.

Errors:
- 401 Unauthorized
- 404 Not Found (work not found or inactive)
- 422 ValidationException (currentPage < 0)

Notes:
- Idempotent: calling repeatedly with the same `currentPage` has the same effect.
- If no `WorkReadingProgress` exists for the user+work combination, one is created with `CurrentPage = 0` then updated to the received value.
- The `userId` is always taken from the authenticated context; clients cannot specify another user's progress.

## GET /api/admin-works

Description:
Returns a paginated list of all works in the catalog.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Title, PublicationDate, CreatedAt, Language, Number)
- orderDir: string (default ASC)
- search: string (optional, partial case-insensitive match on Title and NumberValue)
- workTypeId: long (optional, filter by WorkType)
- isActive: boolean (optional, filter by active state)
- languageId: long (optional, filter by language)
- contentStatus: integer (optional, filter by content status: 0 Missing, 1 Processing, 2 Completed, 3 Error)
- publicationDateFrom: date (optional, inclusive lower bound in UTC)
- publicationDateTo: date (optional, inclusive upper bound in UTC)
- publisherId: long (optional, filter by publisher â€” direct publisher dependency only)
- franchiseId: long (optional, filter by franchise â€” direct franchise dependency only)
- seriesId: long (optional, filter by series â€” direct series dependency only)
- iaRequest: boolean (optional, filter by AI analysis request state: true = requested, false = not requested, absent = no filter)
- iaStatus: integer (optional, filter by AI analysis status: 0 Pending, 1 Processing, 2 Success, 3 Error, absent = no filter)
- withDescription: boolean (optional, filter by description content: true = has description, false = no description, absent = no filter)

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
          "totalCount": 60,
"items": [
                {
                    "id": 1,
                    "title": "Batman #1",
                    "description": "First appearance of Batman.",
                    "languageId": 1,
                    "languageName": "English",
                    "coverId": 100,
                    "urlCover": "/images/100",
                    "isActive": true,
                    "publicationDate": "2026-01-01T00:00:00Z",
                    "createdAt": "2026-01-01T12:00:00Z",
                    "contentStatus": 2,
                    "contentError": null,
                    "workType": "Number",
                    "seriesId": 5,
                    "seriesName": "Batman (2016)",
                    "franchiseId": 2,
                    "franchiseName": "Batman",
                    "publisherId": 1,
                    "publisherName": "DC Comics",
                    "publisherCountryName": "United States",
                    "numberValue": "1",
                    "previousNumberValue": null,
                    "nextNumberValue": "2",
                    "iaStatus": 0,
                    "iaRequestedAt": "2026-01-01T12:00:00Z",
                    "since": "02:10:05.1234567"
                }
            ]
      }
  }

Response Type:
ApiResponse<ListResponse<WorkListItemDto>>

Errors:
- 401 Unauthorized
- 403 Forbidden
- 422 ValidationException (invalid filters)

Notes:
- Requires authentication.
- Requires Administrator role.
- `workTypeId` filters by WorkType catalog entity.
- `contentStatus` maps to: 0 = Missing, 1 = Processing, 2 = Completed, 3 = Error.
- `orderBy` supports: `Title`, `PublicationDate`, `CreatedAt`, `Language`, `Number`.
- `search` matches `Title` for all works and `NumberValue` for works with NumberValue.
- **Filter hierarchy**: exactly one of `publisherId`, `franchiseId`, `seriesId` should be used per request. The endpoint validates this.
- **IA filters**: `iaRequest`, `iaStatus`, `withDescription` available on all list endpoints (global, publisher, franchise, series).
- `iaStatus` maps to: 0 = Pending, 1 = Processing, 2 = Success, 3 = Error.
- Pagination is applied globally in the database.

## GET /api/admin-works/publisher/{publisherId}

Description:
Returns a paginated list of works directly under a Publisher.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- publisherId: long (path parameter)
- currentPage, pageSize, orderBy, orderDir, search, isActive, languageId, contentStatus, publicationDateFrom, publicationDateTo (same as global list)

Response:
- 200 OK â€” same structure as global list

Notes:
- Automatically sets `publisherId` filter and clears `franchiseId`/`seriesId`.
- Returns works where `PublisherId` is set and `FranchiseId`/`SeriesId` are null.

## GET /api/admin-works/franchise/{franchiseId}

Description:
Returns a paginated list of works directly under a Franchise.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- franchiseId: long (path parameter)
- currentPage, pageSize, orderBy, orderDir, search, isActive, languageId, contentStatus, publicationDateFrom, publicationDateTo (same as global list)

Response:
- 200 OK â€” same structure as global list

Notes:
- Automatically sets `franchiseId` filter and clears `publisherId`/`seriesId`.
- Returns works where `FranchiseId` is set and `PublisherId`/`SeriesId` are null.

## GET /api/admin-works/series/{seriesId}

Description:
Returns a paginated list of works under a Series.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request parameters:
- seriesId: long (path parameter)
- currentPage, pageSize, orderBy, orderDir, search, isActive, languageId, contentStatus, publicationDateFrom, publicationDateTo (same as global list)

Response:
- 200 OK â€” same structure as global list

Notes:
- Automatically sets `seriesId` filter and clears `publisherId`/`franchiseId`.
- Returns works where `SeriesId` is set and `PublisherId`/`FranchiseId` are null.

## GET /api/admin-works/{workId}

Description:
Returns the full detail of a single work.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Work detail retrieved successfully.",
      "code": 200,
      "payload": {
          "id": 1,
          "workTypeId": 1,
          "workTypeName": "Number",
          "title": "Batman #1",
          "description": "First appearance of Batman.",
          "languageId": 1,
          "languageName": "English",
          "coverId": 100,
          "urlCover": "/images/100",
          "isActive": true,
          "publicationDate": "2026-01-01T00:00:00Z",
          "createdAt": "2026-01-01T12:00:00Z",
          "contentStatus": 2,
          "contentError": null,
          "seriesId": 5,
          "seriesName": "Batman (2016)",
          "franchiseId": 2,
          "franchiseName": "Batman",
          "publisherId": 1,
          "publisherName": "DC Comics",
          "publisherCountryName": "United States",
          "numberValue": "1",
          "previousNumber": { "id": null, "numberValue": null, "title": null },
          "nextNumber": { "id": 2, "numberValue": "2", "title": "Batman #2" },
          "fileId": 50,
          "pageCount": 24,
          "personByRoles": [...],
          "tags": [...],
          "iaStatus": 2,
          "iaResult": { "title": "Batman #1", "issueNumber": "1", "publisher": "DC Comics", "genre": ["Superhero"], "description": "First appearance of Batman.", "characters": ["Batman", "Joker"], "credits": { "writer": "Tom King", "artist": "Mikel Janin" }, "publicationDate": "2026-01-01T00:00:00Z", "coverImageUrl": "/images/100", "pageCount": 24, "language": "English", "format": "Standard", "rating": "T" },
          "iaRequestedAt": "2026-01-01T12:00:00Z"
      }
  }

Response Type:
ApiResponse<WorkDetailDto>

Errors:
- 404 Not Found

Notes:
- Fully loads all relationships (WorkType, Series, Franchise, Publisher, Language, Cover, File, PersonByRoles, Tags, Pages, PreviousNumber, NextNumber).
- `iaStatus` indicates the AI analysis state: 0 = Pending, 1 = Processing, 2 = Success, 3 = Error.
- `iaResult` contains the deserialized AI analysis result (ComicAnalysisResult) when available (iaStatus = Success), or `null` otherwise.
- `iaResult` is returned as a proper JSON object (not a string containing JSON).
- `iaRequestedAt` indicates when the AI analysis was requested.
- AI analysis state machine:
  - `IARequest = false`, `IAStatus = null` â†’ Never requested
  - `IARequest = true`, `IAStatus = Pending (0)` â†’ Requested, queued
  - `IARequest = true`, `IAStatus = Processing (1)` â†’ Currently being analyzed
  - `IARequest = true`, `IAStatus = Success (2)`, `IAResult = object` â†’ Completed successfully, result available
  - `IARequest = true`, `IAStatus = Error (3)` â†’ Failed, will retry

## POST /api/admin-works

Description:
Creates a new work.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Rate Limiting:
- `AdminWorkCreate` (5/h by user)

Request body:
CreateWorkRequest (JSON):
{
    "workTypeId": 1,
    "title": "Batman #1",
    "description": "First appearance of Batman.",
    "languageId": 1,
    "publicationDate": "2026-01-01T00:00:00Z",
    "coverImageId": null,
    "seriesId": 5,
    "franchiseId": null,
    "publisherId": null,
    "numberValue": "1",
    "previousNumberId": null,
    "nextNumberId": 2,
    "personByRoles": [],
    "tags": [],
    "coverData": null,
    "coverFileName": null
}

Response:
- 201 Created
  Location header: `/api/admin-works/{id}`
  Body: same as GET detail

Errors:
- 422 ValidationException (missing required fields, invalid hierarchy)
- 404 BusinessNotFoundException (referenced entities not found)
- 409 BusinessConflictException (duplicate number in series)
- 429 RateLimitExceededException

Notes:
- Exactly one of `seriesId`, `franchiseId`, `publisherId` must be provided.
- `workTypeId` is classification only; no semantic rules depend on it.
- `coverData`/`coverFileName` are optional binary fields for direct cover upload.

## POST /api/admin-works/with-content

Description:
Creates a new work with CBR content upload.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Rate Limiting:
- `AdminWorkCreate` (5/h by user)

Request:
- Content-Type: multipart/form-data
- Fields: workTypeId, title, languageId (optional), publicationDate (optional), coverImageId (optional), seriesId (optional), franchiseId (optional), publisherId (optional), numberValue (optional), previousNumberId (optional), nextNumberId (optional), personByRoles (JSON), tags (JSON), cover (file, optional), content (file, optional)

Response:
- 201 Created
  Location header: `/api/admin-works/{id}`

Notes:
- If content is provided, a background CBR processing job is enqueued.

## PUT /api/admin-works/{workId}

Description:
Updates an existing work.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request body:
UpdateWorkRequest (JSON) â€” same fields as CreateWorkRequest

Response:
- 200 OK â€” same as GET detail

Errors:
- 404 BusinessNotFoundException
- 422 ValidationException

Notes:
- All fields are replaced (PersonByRoles and Tags are synced, not merged).
- Hierarchy (Publisher/Franchise/Series) can be changed.

## PUT /api/admin-works/{workId}/with-content

Description:
Updates an existing work with optional CBR content upload.

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Request:
- Content-Type: multipart/form-data
- Fields: same as CreateWorkWithContentFormRequest

Response:
- 200 OK â€” same as GET detail

## PATCH /api/admin-works/{workId}/deactivate

Description:
Logically deactivates a work (sets IsActive = false).

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK

Notes:
- Idempotent: if already inactive, returns 200 without changes.

## PATCH /api/admin-works/{workId}/activate

Description:
Logically reactivates a work (sets IsActive = true).

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK

Notes:
- Idempotent: if already active, returns 200 without changes.

## DELETE /api/admin-works/{workId}

Description:
Logically deletes a work (alias for deactivate).

Controller:
AdminWorksController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Response:
- 200 OK

Notes:
- Uses logical deletion (IsActive = false). No physical deletion.

## POST /api/admin-works/{workId}/ai-analysis

Description:
Enqueues an asynchronous AI analysis job for the selected pages of a work. The analysis runs in the background via Hangfire; the endpoint returns immediately without waiting for the AI provider.

Controller:
AdminWorkAIController

Authentication:
- Required. Bearer token in Authorization header.
- Requires Administrator role.

Rate Limiting:
- `AdminAiAnalysis` (10/h by user)

Request body:
AnalyzeComicRequest (JSON):
{
    "imageIds": [101, 102, 103]
}

Validation (executed before any state change or job creation):
- `workId` (path) must exist and be active
- `imageIds` must not be null or empty
- All `imageIds` must correspond to images belonging to the work's content (Pages â†’ Image)
- The work must be in `ContentStatus = Completed` (content already processed)
- Physical files for all selected images must exist in storage
- No active analysis exists (`IAStatus` is not `Pending` or `Processing`)

Behavior:
1. Validates request and work/images.
2. Sets `IARequest = true`, `IAStatus = Pending (0)`, `IAResult = null`, `IARequestedAt = now` on the Work (discarding any previous analysis result).
3. Persists the Work changes.
4. Enqueues a Hangfire Job (queue: `ai-analysis`) with arguments `WorkId` and `ImageIds`.
5. Returns immediately with HTTP 200 OK.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "AI analysis enqueued successfully.",
      "code": 200,
      "payload": null
  }

Errors:
- 400 Bad Request â€” malformed JSON
- 401 Unauthorized
- 403 Forbidden
- 404 BusinessNotFoundException â€” work not found, or one or more images do not belong to the work
- 422 ValidationException â€” work not in Completed status, no images selected, or analysis already in progress (Pending/Processing)
- 429 RateLimitExceededException

Notes:
- The endpoint does **not** execute the AI analysis; it only registers the request and creates the background job.
- The analysis is performed asynchronously by the `WorkAnalysisJob` Hangfire worker (queue: `ai-analysis`).
- A new request for the same work is only allowed when the previous analysis is in `Success` or `Error` state.
- When re-requesting from `Success` or `Error`, the previous `IAResult` is cleared, `IAStatus` is set to `Pending`, and `IARequestedAt` is updated.
- The AI result will be available later in `Work.IAResult` (JSON) and can be retrieved via `GET /api/admin-works/{workId}`.
- Rate limited to 10 requests per hour per user (`AdminAiAnalysis` policy).

## Content endpoints (under /api/admin-works/{workId})

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/admin-works/{workId}/content` | Upload CBR content |
| GET | `/api/admin-works/{workId}/content/status` | Get content processing status |
| POST | `/api/admin-works/{workId}/content/retry` | Retry failed processing |
| DELETE | `/api/admin-works/{workId}/content` | Delete content and pages |
| GET | `/api/admin-works/{workId}/images` | List content images |
| PATCH | `/api/admin-works/{workId}/cover` | Set cover from content image |
| POST | `/api/admin-works/{workId}/ai-analysis` | Enqueue async AI analysis of selected pages |

## Notes

- WorkType is classification only. No endpoint behavior depends on WorkType name or value.
- All optional hierarchy fields (publisherId, franchiseId, seriesId) can be null.
- The endpoints `/api/admin-numbers` and `/api/admin-graphic-novels` no longer exist.
- All administrative work operations must use `/api/admin-works`.