# Endpoints

Controllers covered:
- ListRatingsController — Votes and reviews of a reading list (US-0035)

All responses are `ApiResponse<T>`. Paginated lists use `ApiResponse<ListResponse<TDto>>`.

## POST /api/catalog/lists/{listId}/ratings

Description:
Creates the authenticated user's vote for a list.
The user identity is taken from the JWT; a `userId` in the body is never trusted. Used by the List Reader final
form (rating the list when the last work of the list is reached).

Controller:
ListRatingsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim; the request body must not include `userId`.

Request parameters:
- listId: long (path parameter, required)

Request body:
ListRatingVoteRequest (JSON):
{
    "stars": 4,
    "review": "Great curation."
}

Field rules:
- `stars`: integer from 1 to 5. A `ListRating` record is always a vote, with or without a review. Values outside 1..5 are rejected.
- `review`: optional string. Stored trimmed; an empty or whitespace-only value is stored as `null`.

Behavior:
- When the user has no vote for the list: creates it with `CreatedAt` = now (UTC), `UpdatedAt` = null,
  and increments the list average accumulators (`RatingCount`, `AverageRating`).
- The pair (User, List) is unique at database level, so a duplicate save can never create a second vote.
- A vote never modifies the reading progress of the list or of any of its works.

Response:
- 201 Created
  Location header: `/api/catalog/lists/{listId}/ratings`
  Body:
  {
      "success": true,
      "message": "Rating saved",
      "code": 201,
      "payload": {
          "id": 501,
          "workListId": 101,
          "stars": 4,
          "review": "Great curation.",
          "createdAt": "2026-10-09T15:30:00Z",
          "updatedAt": null
      }
  }

Errors:
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist or is inactive.
- 422 ValidationException when `stars` is outside 1..5.

Notes:
- Returns 201 on create. The `Location` header points to the ratings endpoint,
  which is the stable address of the user's vote for the list.

## PUT /api/catalog/lists/{listId}/ratings

Description:
Edits the authenticated user's vote for a list. Same contract as `POST`; provided so the
Reader can express an explicit edit action without sending a second vote.

Controller:
ListRatingsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user.

Request parameters:
- listId: long (path parameter, required)

Request body:
ListRatingVoteRequest (JSON):
{
    "stars": 5,
    "review": "Even better on a second reading."
}

Behavior:
- When the user has a vote for the list: edits that same record. `CreatedAt` is preserved,
  `UpdatedAt` is set to now, and the average is recomputed.
- When the user has no vote: the service upserts (same as `POST`).
- The pair (User, List) is unique at database level.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Rating updated",
      "code": 200,
      "payload": {
          "id": 501,
          "workListId": 101,
          "stars": 5,
          "review": "Even better on a second reading.",
          "createdAt": "2026-10-09T15:30:00Z",
          "updatedAt": "2026-10-09T16:42:11Z"
      }
  }

Errors:
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist or is inactive.
- 422 ValidationException when `stars` is outside 1..5.
