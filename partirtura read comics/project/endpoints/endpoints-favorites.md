# Endpoints

Controllers covered:
- FavoritesController — Favorites of the authenticated user over Works (US-0035)

## POST /api/favorites/{workId}

Description:
Adds a Work to the favorites of the authenticated user. The user identity is taken from the JWT; a `userId` is
never accepted from the client. Used by the WorkCard star in every surface that renders cards (catalog,
`/favorites`, work detail, history and recommendations).

Controller:
FavoritesController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim.

Request parameters:
- workId: long (path parameter, required)

Behavior:
- The Work must exist and be active; otherwise the operation fails with 404.
- The pair (User, Work) is unique at database level, so a Work can never be duplicated in the favorites of
  the same user. Adding an existing favorite fails with 409.
- Adding a favorite never modifies the reading progress, the reading history, the ratings of the Work or its
  membership in lists.
- The favorite state is exposed as `isFavorite` in the catalog, history and recommended responses.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Favorite added",
      "code": 200,
      "payload": null
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist or is inactive.
- 409 Conflict when the work is already a favorite of the user.

Errors:
- 401 Unauthorized
- 404 Not Found (work not found or inactive)
- 409 Conflict (duplicate favorite)

Notes:
- The endpoint is idempotent from the client point of view for the UI: the star toggles the state and the
  response carries no payload because the next catalog query returns the authoritative `isFavorite`.
- No rate-limit policy is applied, consistent with the rest of the user preference operations.

## DELETE /api/favorites/{workId}

Description:
Removes a Work from the favorites of the authenticated user. The record is physically deleted.

Controller:
FavoritesController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim.

Request parameters:
- workId: long (path parameter, required)

Behavior:
- Only the favorites of the authenticated user can be removed; there is no way to address another user's favorite.
- The record is deleted physically (no `IsActive` flag on the `Favorite` entity).
- Removing a favorite never modifies the reading progress, the reading history, the ratings of the Work or its
  membership in lists.
- Removing a favorite that does not exist fails with 404 and leaves the data in a consistent state.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Favorite removed",
      "code": 200,
      "payload": null
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the work does not exist, is inactive, or was not a favorite of the user.

Errors:
- 401 Unauthorized
- 404 Not Found (work not found, inactive, or favorite not found)

Notes:
- The `Favorite` entity has no `IsActive` property: removing a favorite is a physical deletion, as defined by
  US-0035.
- No rate-limit policy is applied.

## GET /api/works?isFavorite={true|false}

Description:
The public catalog query accepts an optional `isFavorite` filter. `/favorites` reuses the catalog page and
only adds this criterion, without a second search, a second pagination or a duplicated card.

Authentication:
- Required (the catalog is behind `[Authorize]`), because the filter is always evaluated against the
  authenticated user.

Request parameters:
- isFavorite: boolean (optional). `true` returns only the favorites of the authenticated user. `false`, `null`
  or any value other than `true` does not filter the catalog.

Behavior:
- The filter is applied in the database before counting, ordering and paginating, so `totalCount`, `totalPages`
  and `hasNextPage` describe the filtered set.
- The rest of the catalog behavior is preserved: search, hierarchical filters, work type filter and ordering.
- Every returned Work exposes its own `isFavorite` state for the authenticated user, including when the
  filter is not applied.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "currentPage": 1,
          "hasNextPage": false,
          "hasPriorPage": false,
          "totalPages": 1,
          "pageSize": 24,
          "nextPage": null,
          "priorPage": null,
          "totalCount": 1,
          "items": [
              {
                  "id": 17,
                  "title": "Fly Vol.1 #01",
                  "urlCover": "/images/549",
                  "isFavorite": true
              }
          ]
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.

Notes:
- `isFavorite` is a read-only criterion of the catalog response; it is not part of any other request contract.

## GET /api/users/me/reading-history and GET /api/works/recommended

Description:
Both endpoints expose the `isFavorite` state of every Work they return, so the WorkCard star reflects the
persisted state in every context.

Authentication:
- Required. The state is always resolved from the authenticated user; no user identity is accepted from the client.

Behavior:
- The attribute is exclusively part of the response. The request parameters, filters, ordering and pagination
  of both endpoints are unchanged.
- The state is resolved with one batched query per page, never with one query per Work.

Response:
- 200 OK
  Body: the existing payload plus the `isFavorite` boolean in every Work item.

Notes:
- The reading progress and the recommendation rules are not affected by favorites.
