# Endpoints

Controllers covered:
- ListReaderController (`api/reading/lists/{listId}/work/{workId}`) — Full reader context for a single work of a list (US-0035)
- ReadingController (`api/reading/lists/{listId}/current-work`) — Persists the current work of a list (US-0035)

All responses are `ApiResponse<T>`.

## GET /api/reading/lists/{listId}/work/{workId}

Description:
Returns the full reading context for a single work of a list, in one shot, so the
List Reader does not have to combine several endpoints. The payload includes the list
catalog data, the ordered list of works with each work's reading progress and the
user's work rating, and the pages/current page/rating of the work to be read.

Controller:
ListReaderController (`GET /api/reading/lists/{listId}/work/{workId}` delegates to `IListReaderService.GetReaderContextAsync`)

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- `userId` resolved from the `sub` claim.

Request parameters:
- listId: long (path parameter, required)
- workId: long (path parameter, required). Must belong to the list, otherwise 404.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "list": {
              "id": 1,
              "name": "Reading Order",
              "listTypeId": 1,
              "listTypeName": "Reading Order",
              "description": "Complete X-Men reading order",
              "color": "#1877F2",
              "urlCover": "/images/3/list-cover",
              "workCount": 12,
              "readingProgressPercentage": 33,
              "currentWorkId": 7,
              "averageRating": 4.5,
              "ratingCount": 10,
              "myRating": { "workListId": 1, "stars": 4, "review": "...", "createdAt": "...", "updatedAt": "..." }
          },
          "works": [
              { "position": 1, "work": { "id": 5, "title": "...", "description": null, "urlCover": null, "readingProgressPercentage": null }, "currentPage": null, "myRating": null }
          ],
          "workId": 7,
          "pages": [ { "id": 11, "number": 1, "url": "/images/11" } ],
          "currentPage": 3,
          "myRating": { "stars": 4, "review": "..." }
      }
  }

Behavior notes:
- `list.currentWorkId` is the server-side fallback (first work by `WorkListItem.Position`) when the
  user has no `ListReadingProgress`; `null` for an empty list.
- `list.readingProgressPercentage` is `null` when the user has no progress on any of its works;
  `0` for an empty list with a (zero-progress) record.
- `pages`, `currentPage` and the work-level `myRating` come from the existing work pages endpoint;
  they never include created/updated dates (only `stars` and `review`).

Errors:
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist / is inactive, when the work does not exist, or when
  the work does not belong to the list.

## PUT /api/reading/lists/{listId}/current-work

Description:
Registers the work the authenticated user is currently reading in a list. Used by the
List Reader when the user navigates to another work, so reopening the list resumes
in the last work. It only touches `ListReadingProgress.CurrentWork` and
`ListReadingProgress.LastReadAt`; it never alters the page progress of any work.

Controller:
ReadingController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user.

Request parameters:
- listId: long (path parameter, required)

Request body:
SetListCurrentWorkRequest (JSON):
{
    "WorkId": 7
}

Notes on the body:
- The backend field is `WorkId` (PascalCase). JSON binding is case-insensitive, so the
  frontend sends `{ "workId": 7 }`.

Behavior:
- Upserts the `ListReadingProgress` for (user, list), setting `CurrentWork` to the requested work
  and `LastReadAt` to now (UTC).
- When the user had no `ListReadingProgress`, one is created.
- The work must belong to the list, otherwise 404.
- Side effects explicitly avoided: `CurrentPage`, `TotalPages`, `PercentageReading`, the list
  percentage, and any `WorkReadingProgress` are never modified.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Current work updated",
      "code": 200,
      "payload": null
  }

Errors:
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist / is inactive, or when the work does not belong to the list.
