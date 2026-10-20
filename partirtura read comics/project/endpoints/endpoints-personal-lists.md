# Endpoints

Controllers covered:
- MyListsController — Administration of the personal work lists of the authenticated user (US-0036)

Added 2026-10 for US-0036. These endpoints manage the **personal** work lists of the authenticated user
(`OwnerType = User`). They never reach the system lists (`OwnerType = System`), which keep their own
administration rules through `/api/admin-work-lists`. The identity of the user always comes from the JWT;
no endpoint accepts a user identifier from the client.

The works of a personal list are ordinary Works of the catalog: reading, reading progress, ratings and
comments keep working exactly as they do for the system lists.

## POST /api/users/me/lists

Description:
Creates a personal work list for the authenticated user. The client only provides the name: the owner,
the visibility, the type, the color, the description and the cover are defined by the backend.

Controller:
MyListsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The `userId` is extracted from the JWT `sub` claim.

Request body:
- name: string (required, trimmed, max 200 characters)

Response:
- 201 Created
  Body:
  {
      "success": true,
      "message": "Personal list created successfully.",
      "code": 201,
      "payload": {
          "id": 42,
          "name": "Mi lista",
          "description": "Lista creada por Ana Pérez",
          "color": "#38BDF8",
          "urlCover": "/images/318",
          "workCount": 0,
          "createdAt": "2026-10-20T15:30:00Z"
      }
  }
- 400 Bad Request when the name is empty or longer than 200 characters.
- 401 Unauthorized when the bearer token is missing or invalid.
- 409 Conflict when a work list with the same name already exists (the name is unique in the system, as in the
  administration endpoints).

Notes:
- The new list is persisted with `OwnerType = User`, `Visibility = Private`, `IsActive = true`, no `ListType`,
  the brand blue `#38BDF8` as color and the description `Lista creada por {nombre de usuario}`.
- The cover is a **copy of the generic cover asset** stored through the regular image flow, so every list owns
  its own file and a later change on one list never affects another one.
- A new list may be created without works.

## GET /api/users/me/lists

Description:
Returns the personal lists of the authenticated user with the membership of an optional work, so Public Web can
render the list selector of the work card (one checkbox per list) and know the initial state of each one.

Controller:
MyListsController

Authentication:
- Required. Bearer token in Authorization header.
- Any authenticated user. Does not require the Administrator role.
- The owner is always the authenticated user; the request never accepts a user identifier.

Request parameters (query):
- search: string (optional) — filters the lists by name (partial match).
- pageSize: int (optional, default 12, max 50) — maximum number of lists to return.
- workId: long (optional) — the work whose membership is checked. When it is omitted, `containsWork` is `false`
  for every list.

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": [
          {
              "id": 42,
              "name": "Mi lista",
              "description": "Lista creada por Ana Pérez",
              "color": "#38BDF8",
              "urlCover": "/images/318",
              "workCount": 3,
              "containsWork": true
          },
          {
              "id": 43,
              "name": "Otra lista",
              "description": "Lista creada por Ana Pérez",
              "color": "#38BDF8",
              "urlCover": "/images/319",
              "workCount": 1,
              "containsWork": false
          }
      ]
  }
- 400 Bad Request when `pageSize` is not a positive number.
- 401 Unauthorized when the bearer token is missing or invalid.
- 422 Unprocessable Entity when `pageSize` is zero or negative.

Errors:
- 401 Unauthorized
- 422 Unprocessable Entity (invalid `pageSize`)

Notes:
- The response contains **only** the personal lists of the authenticated user. The system lists and the personal
  lists of other users are never included.
- `containsWork` is `true` when the work of `workId` belongs to that personal list, and `false` otherwise. A work
  that belongs to no personal list returns `false` for every list.
- The ordering is: first the lists that contain the work, then the lists that do not, and inside each group the
  lists are sorted by name ascending. The `search` filter does not change that order.
- The search, the membership calculation, the ordering and the `pageSize` limit are applied in the database
  before the results are materialized: no query per list.
- The operation is read-only: it never modifies data.
- The Public Web can use the existing `POST /api/users/me/lists/{listId}/works` and
  `DELETE /api/users/me/lists/{listId}/works/{workId}` to add or remove the work from each list.

## GET /api/users/me/lists/{listId}

Description:
Returns the summary of one of the personal lists of the authenticated user.

Controller:
MyListsController

Authentication:
- Required. The list is only returned when it belongs to the authenticated user.

Request parameters:
- listId: long (path parameter, required)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "OK",
      "code": 200,
      "payload": {
          "id": 42,
          "name": "Mi lista",
          "description": "Lista creada por Ana Pérez",
          "color": "#38BDF8",
          "urlCover": "/images/318",
          "workCount": 3,
          "createdAt": "2026-10-20T15:30:00Z"
      }
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist, is not personal or belongs to another user.

Notes:
- The full detail of a personal list (with its works) is also available through `GET /api/catalog/lists/{id}`,
  which returns it when the list belongs to the authenticated user.

## PUT /api/users/me/lists/{listId}

Description:
Renames one of the personal lists of the authenticated user. Only the name is modified.

Controller:
MyListsController

Authentication:
- Required. The list must belong to the authenticated user.

Request parameters:
- listId: long (path parameter, required)

Request body:
- name: string (required, trimmed, max 200 characters)

Response:
- 200 OK
  Body: the same payload of `GET /api/users/me/lists/{listId}`.
- 400 Bad Request when the name is empty or longer than 200 characters.
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist, is not personal or belongs to another user.
- 409 Conflict when another work list already uses that name.

Notes:
- The color, the cover, the description, the owner and the works of the list are not modified.

## DELETE /api/users/me/lists/{listId}

Description:
Deletes one of the personal lists of the authenticated user, together with all the records that relate works
to that list.

Controller:
MyListsController

Authentication:
- Required. The list must belong to the authenticated user.

Request parameters:
- listId: long (path parameter, required)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Personal list deleted successfully.",
      "code": 200,
      "payload": null
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist, is not personal or belongs to another user.

Notes:
- The deletion is physical: the list and its `WorkListItem` rows are removed.
- The Works of the list are **not** deleted, and neither are their reading progress, ratings, comments or
  favorites. Other lists are not affected.
- The cover file of the list is also removed from the image storage.

## POST /api/users/me/lists/{listId}/works

Description:
Adds a work to one of the personal lists of the authenticated user.

Controller:
MyListsController

Authentication:
- Required. The list must belong to the authenticated user.

Request parameters:
- listId: long (path parameter, required)

Request body:
- workId: long (required)

Response:
- 200 OK
  Body: the summary of the list, with the updated `workCount`.
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist, is not personal, belongs to another user, or the work does not
  exist or is inactive.
- 409 Conflict when the work already belongs to the list.

Notes:
- The work is added at the end of the list: its position is the highest position of the list plus one. The
  positions are 0-based.
- Only the relation between the list and the work is created. The work keeps its own data, its reading
  progress, its ratings and its membership in the system lists.

## DELETE /api/users/me/lists/{listId}/works/{workId}

Description:
Removes a work from one of the personal lists of the authenticated user. Only the relation is removed.

Controller:
MyListsController

Authentication:
- Required. The list must belong to the authenticated user.

Request parameters:
- listId: long (path parameter, required)
- workId: long (path parameter, required)

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Work removed from the personal list successfully.",
      "code": 200,
      "payload": null
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist, is not personal, belongs to another user, or the work does not
  belong to the list.

Notes:
- The `WorkListItem` row is physically deleted. The work stays in the catalog and keeps its data, its reading
  progress, its ratings and its membership in the other lists.
- The remaining works are not renumbered: a gap in the positions is expected and harmless, because the position
  only determines the order.

## PUT /api/users/me/lists/{listId}/works/order

Description:
Persists the new order of the works of a personal list, after a drag & drop reordering.

Controller:
MyListsController

Authentication:
- Required. The list must belong to the authenticated user.

Request parameters:
- listId: long (path parameter, required)

Request body:
- works: array of objects (required, may be empty)
  - workId: long (required) — the work whose position changed.
  - position: int (required) — the new position of the work.

Example:
{
    "works": [
        { "workId": 17, "position": 1 },
        { "workId": 42, "position": 2 },
        { "workId": 8, "position": 3 }
    ]
}

Response:
- 200 OK
  Body:
  {
      "success": true,
      "message": "Personal list order updated successfully.",
      "code": 200,
      "payload": null
  }
- 401 Unauthorized when the bearer token is missing or invalid.
- 404 Not Found when the list does not exist, is not personal, belongs to another user, or one of the works does
  not belong to the list.
- 409 Conflict when the request repeats a position, or when a requested position is still held by a work that is
  not part of the request.

Notes:
- The client only sends the works **whose position changed**. Example: with the order `{0, a} {1, b} {2, c}
  {3, d}`, moving `d` to the place of `c` results in `{0, a} {1, d} {2, b} {3, c}`, so the request is
  `{1, d} {2, b} {3, c}`.
- The update is transactional: the affected rows are first moved to a temporary offset and then to their final
  position, so the order is never left half applied and the unique `(WorkListId, Position)` index is respected.
- The position only determines the order. Gaps are allowed and the works that are not part of the request keep
  their position.
