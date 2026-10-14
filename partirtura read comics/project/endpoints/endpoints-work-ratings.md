# Endpoints

Controllers covered:
- WorkRatingsController — Votes and reviews of a Work (US-0030)

## POST /api/works/{workId}/ratings

Description:
Creates the authenticated user's vote for a Work, or edits the existing one when the user already voted.
The user identity is taken from the JWT; a `userId` in the body is never trusted. Used by the Reader final
form (position `TotalPages + 1`) and by the Work detail page.

Controller:
WorkRatingsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim; the request body must not include `userId`.

Request parameters:
- workId: long (path parameter, required)

Request body:
WorkRatingVoteRequest (JSON):
{
    "stars": 4,
    "review": "Excellent issue."
}

Field rules:
- `stars`: nullable integer from 0 to 5. `null` or `0` means the user voted without selecting any star.
  A `WorkRating` record is always a vote, with or without a review. Values outside 0..5 are rejected.
- `review`: optional string. Stored trimmed; an empty or whitespace-only value is stored as `null`.

Behavior:
- When the user has no vote for the Work: creates it with `CreatedAt` = now (UTC), `UpdatedAt` = null,
  and increments `Work.RatingCount` (zero-star votes included).
- When the user already voted for the Work: edits that same record. `CreatedAt` is preserved,
  `UpdatedAt` is set to now, and `Work.RatingCount` never changes. The average is recomputed only when
  the score changes.
- The pair (User, Work) is unique at database level, so a duplicate save can never create a second vote.
- A vote never modifies the reading progress of the Work.

Response:
- 201 Created
  Location header: `/api/works/{workId}/ratings`
  Body:
  {
      "success": true,
      "message": "Rating saved",
      "code": 201,
      "payload": {
          "id": 501,
          "workId": 101,
          "stars": 4,
          "review": "Excellent issue.",
          "createdAt": "2026-10-09T15:30:00Z",
          "updatedAt": null
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.
- 422 ValidationException when `stars` is outside 0..5.

Errors:
- 401 Unauthorized
- 404 Not Found (work not found or inactive)
- 422 ValidationException (score out of range)

Notes:
- Returns 201 on both create and edit (upsert). The `Location` header points to the ratings listing,
  which is the stable address of the user's vote for the Work.
- No rate-limit policy is applied, consistent with `PUT /api/works/{id}/progress`.

## PUT /api/works/{workId}/ratings

Description:
Edits the authenticated user's vote for a Work. Same contract as `POST`; provided so the Reader and the
detail page can express an explicit edit action.

Controller:
WorkRatingsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim.

Request parameters:
- workId: long (path parameter, required)

Request body:
WorkRatingVoteRequest (JSON) — same as `POST`.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Rating updated",
      "code": 200,
      "payload": {
          "id": 501,
          "workId": 101,
          "stars": 5,
          "review": "Even better on a second read.",
          "createdAt": "2026-10-09T15:30:00Z",
          "updatedAt": "2026-10-09T16:05:00Z"
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.
- 422 ValidationException when `stars` is outside 0..5.

Notes:
- Only the authenticated user's own vote can be edited: the service resolves the vote by
  (authenticated user, work). There is no way to address another user's vote.
- A user who never voted can also use `PUT`; the operation creates the vote (same upsert as `POST`).
- `Work.RatingCount` is never incremented by an edit.

## GET /api/works/{workId}/ratings

Description:
Returns the paginated list of votes and reviews of a Work, for the Work detail page.

Controller:
WorkRatingsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.

Request parameters:
- workId: long (path parameter, required)
- currentPage: integer (default 1)
- pageSize: integer (default 12, max 50)
- orderBy: string (optional, allowed: Stars, CreatedAt; default CreatedAt)
- orderDir: string (optional, ASC or DESC; default DESC)

Behavior:
- Ratings of Works that do not exist or are inactive are never exposed (404).
- Zero-star votes are ordinary rows: they are listed like any other vote.
- Ordering is applied in the database with `Id` as tie-breaker, so pagination is stable.
- `Stars` DESC gives "best rated first", `Stars` ASC gives "worst rated first",
  `CreatedAt` DESC gives "most recent first", `CreatedAt` ASC gives "oldest first".

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
          "pageSize": 12,
          "nextPage": 2,
          "priorPage": null,
          "totalCount": 42,
          "items": [
              {
                  "id": 501,
                  "userId": 12,
                  "userName": "Jane Reader",
                  "urlAvatar": "/images/88",
                  "stars": 5,
                  "review": "Even better on a second read.",
                  "createdAt": "2026-10-09T15:30:00Z"
              },
              {
                  "id": 502,
                  "userId": 15,
                  "userName": "John Reader",
                  "urlAvatar": null,
                  "stars": 0,
                  "review": null,
                  "createdAt": "2026-10-08T10:00:00Z"
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.

Response Type:
ApiResponse<ListResponse<WorkRatingListItemDto>>

DTO:
`Application/DTOs/WorkRatingDtos.cs` — `WorkRatingVoteRequest` (Stars, Review), `GetWorkRatingsRequest`
(currentPage, pageSize, orderBy, orderDir), `WorkRatingDto` (Id, WorkId, Stars, Review, CreatedAt, UpdatedAt),
`WorkRatingListItemDto` (Id, UserId, UserName, UrlAvatar, Stars, Review, CreatedAt).

Notes:
- `urlAvatar` is built with `ImageUrlBuilder.ToUrl` (`/images/{imageId}`) and is `null` when the user has no avatar.
- The visual presentation (stars rendering, layout) belongs to the Frontend; the contract only returns the data.
- Read-only. No side effects.
